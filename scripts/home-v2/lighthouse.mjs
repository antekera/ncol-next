// npm exec --yes --package=lighthouse@13.5.0 -- node scripts/home-v2/lighthouse.mjs URL OUTPUT_DIR
import { existsSync, mkdirSync, realpathSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { delimiter, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { gzipSync } from 'node:zlib'

const [target, output] = process.argv.slice(2)
if (
  !target ||
  !output ||
  !['http:', 'https:'].includes(new URL(target).protocol)
) {
  throw new Error('Provide an HTTP(S) URL and a new output directory')
}
const out = resolve(output)
if (existsSync(join(out, 'runs.json')))
  throw new Error('Refusing to overwrite prior measurements')
const binary = (process.env.PATH ?? '')
  .split(delimiter)
  .map(directory => join(directory, 'lighthouse'))
  .find(file => existsSync(file))
if (!binary) throw new Error('Run via npm exec --package=lighthouse@13.5.0')
const requireLighthouse = createRequire(realpathSync(binary))
const { default: lighthouse, desktopConfig } = await import(
  pathToFileURL(requireLighthouse.resolve('lighthouse')).href
)
const { launch } = await import(
  pathToFileURL(requireLighthouse.resolve('chrome-launcher')).href
)
mkdirSync(out, { recursive: true })
const rows = []
for (const device of ['mobile', 'desktop']) {
  const chrome = await launch({ chromeFlags: ['--headless=new'] })
  try {
    for (let iteration = 1; iteration <= 5; iteration++) {
      for (const cache of ['cold', 'warm']) {
        const name = `${device}-${cache}-${iteration}`
        const result = await lighthouse(
          target,
          {
            port: chrome.port,
            logLevel: 'error',
            onlyCategories: ['performance'],
            output: 'html',
            disableStorageReset: cache === 'warm',
            blockedUrlPatterns: [
              '*google-analytics.com/g/collect*',
              '*analytics.google.com/g/collect*'
            ]
          },
          device === 'desktop' ? desktopConfig : undefined
        )
        if (result.lhr.runtimeError)
          throw new Error(result.lhr.runtimeError.message)
        const audits = result.lhr.audits
        writeFileSync(
          join(out, `${name}.json.gz`),
          gzipSync(JSON.stringify(result.lhr))
        )
        writeFileSync(join(out, `${name}.html.gz`), gzipSync(result.report))
        if (result.artifacts.Trace)
          writeFileSync(
            join(out, `${name}.trace.json.gz`),
            gzipSync(JSON.stringify(result.artifacts.Trace))
          )
        rows.push({
          name,
          device,
          cache,
          iteration,
          node: process.version,
          date: result.lhr.fetchTime,
          lighthouseVersion: result.lhr.lighthouseVersion,
          score: result.lhr.categories.performance.score,
          metrics: Object.fromEntries(
            [
              'largest-contentful-paint',
              'cumulative-layout-shift',
              'total-blocking-time',
              'first-contentful-paint',
              'speed-index',
              'total-byte-weight',
              'bootup-time',
              'mainthread-work-breakdown'
            ].map(key => [key, audits[key]?.numericValue])
          ),
          settings: result.lhr.configSettings,
          environment: result.lhr.environment,
          warnings: result.lhr.runWarnings,
          network: audits['network-requests']?.details?.items?.map(
            ({
              url,
              resourceType,
              transferSize,
              resourceSize,
              statusCode,
              networkRequestTime,
              networkEndTime
            }) => ({
              url: url.split('?')[0],
              resourceType,
              transferSize,
              resourceSize,
              statusCode,
              duration: networkEndTime - networkRequestTime
            })
          )
        })
        writeFileSync(
          join(out, 'runs.json'),
          `${JSON.stringify(rows, null, 2)}\n`
        )
        console.log(
          JSON.stringify({
            name,
            score: rows.at(-1).score,
            metrics: rows.at(-1).metrics
          })
        )
      }
    }
  } finally {
    await chrome.kill()
  }
}
