import { chromium } from '@playwright/test'
import { existsSync, readFileSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

// Local diagnostic, not RUM: Node 24, an opt-in traditional audit server on
// localhost:3212, then node scripts/home-v2/lcp-headline-probe.mjs NEW_FILE
// [--throttled]. The second case requests the server-rendered short-headline QA
// fixture, so the HTML and React payload agree. It never mutates editorial DOM.
// Add --cpu-profile to save native V8 samples beside the result; --short-only
// limits iterative diagnostics to the unfavorable server fixture. --control
// observes the existing control once, for a matching ad-chain diagnostic.
const output = process.argv[2]
if (!output || existsSync(output))
  throw Error(
    'Provide a new output filename; existing evidence is never overwritten'
  )
if (process.versions.node.split('.')[0] !== '24')
  throw Error('Use the project Node 24 runtime')
const layoutSha256 = createHash('sha256')
  .update(readFileSync(new URL('../../src/app/layout.tsx', import.meta.url)))
  .digest('hex')
const rows = []
const throttled = process.argv.includes('--throttled')
const cpuProfile = process.argv.includes('--cpu-profile')
const control = process.argv.includes('--control')
if (control && process.argv.includes('--short-only'))
  throw Error('The control has no short-headline fixture')
const cases = control
  ? [false]
  : process.argv.includes('--short-only')
    ? [true]
    : [false, true]
for (const short of cases) {
  if (
    cpuProfile &&
    existsSync(`${output}.${short ? 'short' : 'current'}.cpuprofile`)
  )
    throw Error('Existing CPU evidence is never overwritten')
}
const browser = await chromium.launch({ channel: 'chrome' })
try {
  for (const short of cases) {
    const context = await browser.newContext({
      viewport: { width: 412, height: 823 },
      deviceScaleFactor: 1.75,
      isMobile: true
    })
    await context.route(
      /google-analytics\.com\/.*collect|analytics\.google\.com\/.*collect|\/api\/track(?:\?|$)/,
      route => route.fulfill({ status: 204 })
    )
    await context.addInitScript(() => {
      window.__lcpCandidates = []
      new PerformanceObserver(list => {
        for (const e of list.getEntries())
          window.__lcpCandidates.push({
            time: e.startTime,
            size: e.size,
            tag: e.element?.tagName,
            sticky: !!e.element?.closest('[data-home-occluder="ad-sticky"]'),
            opening: !!e.element?.closest('[data-module-id="opening"]')
          })
      }).observe({ type: 'largest-contentful-paint', buffered: true })
    })
    try {
      const page = await context.newPage()
      let hydrationErrors = 0
      const hydration = /hydrat|react\.dev\/errors\/(?:418|423|425)/i
      page.on('pageerror', error => {
        if (hydration.test(error.message)) hydrationErrors++
      })
      page.on('console', message => {
        if (message.type() === 'error' && hydration.test(message.text()))
          hydrationErrors++
      })
      page.setDefaultTimeout(30000)
      const cdp =
        throttled || cpuProfile ? await context.newCDPSession(page) : null
      if (cpuProfile) {
        await cdp.send('Profiler.enable')
        await cdp.send('Profiler.setSamplingInterval', { interval: 1000 })
        await cdp.send('Profiler.start')
      }
      if (throttled) {
        await cdp.send('Network.enable')
        await cdp.send('Network.emulateNetworkConditions', {
          offline: false,
          latency: 562.5,
          downloadThroughput: (1474.56 * 1024) / 8,
          uploadThroughput: (675 * 1024) / 8
        })
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
      }
      const url = new URL(
        'http://localhost:3212/?__ncol_home_audit=v2&__ncol_home_measurement=1'
      )
      if (control) url.searchParams.set('__ncol_home_audit', 'control')
      if (short) url.searchParams.set('__ncol_home_audit_headline', 'short')
      await page.goto(url.href)
      await page.waitForSelector(
        `[data-home-variant="${control ? 'control' : 'v2'}"]`
      )
      if (!control)
        await page.waitForSelector('[data-opening-treatment="traditional"]')
      await page.waitForTimeout(6000)
      const result = await page.evaluate(
        variant => {
          const img = document.querySelector(
            '[data-home-occluder="ad-sticky"] img'
          )
          const h1 = document.querySelector(
            `[data-home-variant="${variant}"] h1`
          )
          const bounds = el => {
            const r = el?.getBoundingClientRect()
            return r
              ? {
                  width: r.width,
                  height: r.height,
                  top: r.top,
                  bottom: r.bottom
                }
              : null
          }
          return {
            candidates: window.__lcpCandidates,
            headlineLength: h1?.textContent.length,
            headline: bounds(h1),
            sticky: bounds(img),
            loaded: img?.complete,
            hidden: img
              ?.closest('[data-home-occluder]')
              ?.getAttribute('aria-hidden'),
            resources: performance
              .getEntriesByType('resource')
              .filter(
                r =>
                  r.name.includes('/rest/v1/ads?') || r.name === img?.currentSrc
              )
              .map(r => ({
                url: r.name.split('?')[0],
                start: r.startTime,
                end: r.responseEnd,
                duration: r.duration,
                // Cross-origin response sizes may be unavailable without TAO.
                bytes: r.encodedBodySize || null
              }))
          }
        },
        control ? 'control' : 'v2'
      )
      if (!result.candidates?.length)
        throw Error('No LCP candidates recorded; diagnostic is incomplete')
      if (!result.sticky || !result.loaded || result.hidden === 'true')
        throw Error(
          'Sticky creative not ready; this conditional LCP diagnostic is incomplete'
        )
      if (
        short &&
        result.headlineLength !== 'Noticias de última hora en Zulia'.length
      )
        throw Error(
          'Server short-headline fixture missing; use a current traditional audit build'
        )
      if (hydrationErrors)
        throw Error('Hydration errors invalidate this diagnostic')
      let cpuProfileFile
      if (cpuProfile) {
        const { profile } = await cdp.send('Profiler.stop')
        cpuProfileFile = `${output}.${short ? 'short' : 'current'}.cpuprofile`
        await writeFile(cpuProfileFile, JSON.stringify(profile), { flag: 'wx' })
      }
      rows.push({
        kind: 'lab-diagnostic-not-field',
        homeVariant: control ? 'control' : 'v2',
        node: process.version,
        layoutSha256,
        ...(cpuProfileFile ? { cpuProfileFile } : {}),
        shortHeadlineFixture: short,
        hydrationErrors,
        browser: await browser.version(),
        profile: throttled
          ? 'CDP request throttling, latency 562.5ms/download1474.56kbps/upload675kbps/CPU4x, cold context, 412x823'
          : 'No throttling, cold context, 412x823',
        ...result
      })
      console.log(JSON.stringify(rows.at(-1)))
    } finally {
      await context.close()
    }
  }
  await writeFile(output, JSON.stringify(rows, null, 2) + '\n', { flag: 'wx' })
} finally {
  await browser.close()
}
