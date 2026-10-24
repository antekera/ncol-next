import { test, expect } from './fixtures'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runInNewContext } from 'node:vm'

// Run against an isolated production build; this never changes deployment flags.
const mode = process.env.HOME_V2_RELEASE_E2E
const dataLayerEvents = (page: import('@playwright/test').Page) =>
  page.evaluate(() =>
    (window.dataLayer ?? []).filter(
      (value): value is Record<string, unknown> =>
        typeof value === 'object' && value !== null && 'event' in value
    )
  )
test.describe('Home public release and rollback', () => {
  test.skip(
    !['enabled', 'rollback'].includes(mode ?? ''),
    'Requires a release build'
  )

  test('the local durable processor and recovery reader authenticate server requests through the real proxy', async ({
    request,
    baseURL
  }) => {
    test.skip(
      process.env.HOME_V2_DURABLE_E2E !== 'true',
      'Requires the prewarmed local SQL fixture'
    )
    expect(new URL(baseURL!).hostname).toBe('127.0.0.1')
    const rejected = await request.get('/api/home-v2/refresh', {
      maxRedirects: 0
    })
    expect(rejected.status()).toBe(401)
    expect(await rejected.json()).toEqual({ error: 'unauthorized' })
    const accepted = await request.get('/api/home-v2/refresh', {
      headers: { authorization: 'Bearer local-cache-processor' },
      maxRedirects: 0
    })
    expect(accepted.status()).toBe(200)
    expect(accepted.headers()['cache-control']).toBe('no-store')
    expect(await accepted.json()).toEqual({ ok: true, status: 'idle' })
    const deniedRead = await request.get('/api/home-v2/snapshot', {
      maxRedirects: 0
    })
    expect(deniedRead.status()).toBe(401)
    expect(await deniedRead.json()).toEqual({ error: 'unauthorized' })
    const wrongScope = await request.get('/api/home-v2/snapshot', {
      headers: {
        authorization: 'Bearer local-cache-processor',
        'x-ncol-home-key': 'different-preview'
      },
      maxRedirects: 0
    })
    expect(wrongScope.status()).toBe(409)
    const key = process.env.HOME_V2_RELEASE_SNAPSHOT_KEY
    expect(key).toMatch(/^home-v2-raw-v1:local:/)
    const read = await request.get('/api/home-v2/snapshot', {
      headers: {
        authorization: 'Bearer local-cache-processor',
        'x-ncol-home-key': key!
      },
      maxRedirects: 0
    })
    expect(read.status()).toBe(200)
    expect(read.headers()['cache-control']).toBe('no-store')
    expect(read.headers()['set-cookie']).toBeUndefined()
    const body = await read.json()
    expect(body.key).toBe(key)
    expect(body.snapshot.data.errors).toEqual([])
    expect(body.snapshot.fetchedAt).toEqual(expect.any(Number))
  })

  test('the compiled root excludes the inactive Home client bundle', () => {
    const buildDir = process.env.HOME_V2_RELEASE_BUILD_DIR
    expect(
      buildDir,
      'Provide the isolated production build directory'
    ).toBeTruthy()
    const context: {
      globalThis: {
        __RSC_MANIFEST?: Record<
          string,
          {
            clientModules: Record<string, { chunks: string[] }>
          }
        >
      }
    } = { globalThis: {} }
    runInNewContext(
      readFileSync(
        resolve(buildDir!, 'server/app/page_client-reference-manifest.js'),
        'utf8'
      ),
      context
    )
    const modules = Object.entries(
      Object.values(context.globalThis.__RSC_MANIFEST!)[0].clientModules
    )
    const chunks = (suffix: string) =>
      modules.find(([file]) => file.replaceAll('\\', '/').endsWith(suffix))?.[1]
        .chunks ?? []
    const v2 = chunks('/HomeV2/RegionalFilter.tsx')
    const legacy = chunks('/blocks/content/HomeLeftPosts/index.tsx')
    expect(mode === 'enabled' ? v2.length : legacy.length).toBeGreaterThan(0)
    expect(mode === 'enabled' ? legacy : v2).toEqual([])
  })

  for (const width of [390, 1440]) {
    test(`${width}px: ${mode} preserves the public route and a single footer ad across navigation`, async ({
      page
    }) => {
      await page.setViewportSize({ width, height: 900 })
      let actions = 0
      let regionGets = 0
      page.on('request', request => {
        if (request.headers()['next-action']) actions++
        if (
          request.method() === 'GET' &&
          request.url().includes('/api/home-v2/region/')
        )
          regionGets++
      })
      await page
        .context()
        .route(
          /googletagmanager\.com|google-analytics\.com|analytics\.google\.com|googlesyndication\.com|doubleclick\.net|ingest\.sentry\.io|\/api\/track(?:\?|$)/,
          route => route.fulfill({ status: 204 })
        )
      await page.context().route(/\/rest\/v1\/ads(?:\?|$)/, route =>
        route.fulfill({
          json: [
            {
              id: 'release-footer',
              type: 'html',
              slot: 'footer',
              device_target: 'all',
              html_content:
                '<div data-testid="release-footer" style="width:300px;height:90px">Aviso de prueba</div>'
            }
          ]
        })
      )
      await page
        .context()
        .route(/\/rest\/v1\/ad_slot_fallbacks_public(?:\?|$)/, route =>
          route.fulfill({ json: [] })
        )
      const response = await page.goto('/')
      expect(response?.status()).toBe(200)
      if (mode === 'rollback')
        await expect(page.locator('body')).not.toHaveAttribute(
          'data-home-vitals-environment'
        )
      await expect(page.getByRole('main')).toHaveCount(1)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        'https://www.noticiascol.com/'
      )
      await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute(
        'content',
        /noindex/
      )
      await expect(page.getByTestId('release-footer')).toHaveCount(1)
      await expect
        .poll(
          async () =>
            (await dataLayerEvents(page)).filter(
              event => event.event === 'CUSTOM_PAGE_VIEW'
            ).length
        )
        .toBe(1)
      const homeView = (await dataLayerEvents(page)).find(
        event => event.event === 'CUSTOM_PAGE_VIEW'
      )!
      if (mode === 'enabled')
        expect(homeView).toMatchObject({ home_version: 'v2', pageUrl: '/' })
      else expect(homeView).not.toHaveProperty('home_version')
      expect(
        (await dataLayerEvents(page)).every(
          event => !('experiment_id' in event) && !('home_variant' in event)
        )
      ).toBe(true)
      const home = page.locator('[data-home-variant="v2"]')
      if (mode === 'enabled') {
        await expect(home).toHaveCount(1)
        await expect(home.getByRole('heading', { level: 1 })).toHaveCount(1)
        await expect(
          home.locator('section[data-module-id="opening"]')
        ).toHaveCount(1)
        await expect(home.getByTestId('release-footer')).toHaveCount(1)
        await expect
          .poll(
            async () =>
              (await dataLayerEvents(page)).filter(
                event =>
                  event.event === 'MODULE_IMPRESSION' &&
                  event.module_id === 'opening'
              ).length
          )
          .toBe(1)
        const hero = home.locator('[data-article-id]').first()
        const heroId = await hero.getAttribute('data-article-id')
        const heroLink = hero.locator('a').first()
        await heroLink.evaluate(node => {
          ;(node as HTMLAnchorElement).target = '_blank'
        })
        const opened = page.context().waitForEvent('page')
        await heroLink.click()
        const destinationTab = await opened
        await destinationTab.waitForLoadState('domcontentloaded')
        await destinationTab.close()
        await page.bringToFront()
        await heroLink.evaluate(node => node.removeAttribute('target'))
        await expect
          .poll(
            async () =>
              (await dataLayerEvents(page)).filter(
                event =>
                  event.event === 'CLICK_EVENT' &&
                  event.home_version === 'v2' &&
                  event.home_view_id === homeView.home_view_id &&
                  event.module_id === 'opening' &&
                  event.article_id === heroId
              ).length
          )
          .toBe(1)
        expect(
          (await dataLayerEvents(page)).filter(
            event => event.event === 'CLICK_EVENT'
          )
        ).toHaveLength(1)
        expect(
          await page.evaluate(() =>
            Object.keys(localStorage).filter(key =>
              /^ncol:home-v2-(?:reading|origin):/.test(key)
            )
          )
        ).toEqual([])
        if (width >= 768) {
          for (const sidebar of await home.locator('aside[aria-label]').all()) {
            expect((await sidebar.boundingBox())!.width).toBeGreaterThanOrEqual(
              300
            )
          }
        }
        const region = home.locator('section[data-module-id="zulia"]')
        const select = region.getByRole('combobox', {
          name: 'Municipio o región'
        })
        expect(regionGets).toBe(0)
        await page
          .context()
          .addCookies([
            { name: 'qa-region-cookie', value: 'fixture', url: page.url() }
          ])
        const firstRegionResponse = page.waitForResponse(response =>
          response.url().includes('/api/home-v2/region/')
        )
        await select.selectOption('maracaibo')
        const firstRegion = await firstRegionResponse
        expect(firstRegion.status()).toBe(200)
        expect(firstRegion.request().method()).toBe('GET')
        expect(await firstRegion.request().headerValue('cookie')).toBeNull()
        const regionalPayload = await firstRegion.json()
        await expect(region).toHaveAttribute('data-region-id', 'maracaibo')
        await expect(region).toHaveAttribute('aria-busy', 'false')
        await expect(region.getByRole('status')).toHaveText('')
        await select.selectOption('zulia')
        await expect(region).toHaveAttribute('data-region-id', 'zulia')
        const beforeRepeat = regionGets
        await select.selectOption('maracaibo')
        await expect(region).toHaveAttribute('data-region-id', 'maracaibo')
        expect(actions).toBe(0)
        expect(regionGets).toBe(
          beforeRepeat + (regionalPayload.cacheUntil > Date.now() ? 0 : 1)
        )
        await home
          .locator('section[data-module-id="nacionales"] a')
          .first()
          .click()
      } else {
        await expect(home).toHaveCount(0)
        await expect(page.locator('[data-home-variant="control"]')).toHaveCount(
          1
        )
        await expect(
          page.locator('main').getByTestId('release-footer')
        ).toHaveCount(0)
        await page.goto('/categoria/nacionales/')
      }
      await expect(page).toHaveURL(/\/categoria\/nacionales\/$/)
      if (mode === 'enabled') {
        await expect
          .poll(async () =>
            (await dataLayerEvents(page)).some(
              event =>
                event.event === 'CLICK_EVENT' &&
                event.home_view_id === homeView.home_view_id &&
                event.home_version === 'v2' &&
                event.module_id === 'nacionales' &&
                event.component_type === 'section_link'
            )
          )
          .toBe(true)
      }
      await expect(
        page.getByRole('heading', { level: 1 }).first()
      ).toContainText(/Nacionales/i)
      await expect(page.getByTestId('release-footer')).toHaveCount(1)
      await expect(
        page.locator('main').getByTestId('release-footer')
      ).toHaveCount(0)
      const article = page.locator('main article a[href]').first()
      await expect(article).toBeVisible()
      const destination = new URL(
        (await article.getAttribute('href'))!,
        page.url()
      )
      await article.click()
      await expect(page).toHaveURL(destination.href)
      await expect(
        page.getByRole('heading', { level: 1 }).first()
      ).toBeVisible()
      await expect
        .poll(async () =>
          (await dataLayerEvents(page)).some(
            event =>
              event.event === 'CUSTOM_PAGE_VIEW' &&
              event.pageUrl === destination.pathname &&
              !('home_version' in event)
          )
        )
        .toBe(true)
      await expect(page.getByTestId('release-footer')).toHaveCount(1)
      await expect(
        page.locator('main').getByTestId('release-footer')
      ).toHaveCount(0)
      const beforeReturningHome = regionGets
      await page.goto('/?__ncol_home_audit=v2&__ncol_home_measurement=1')
      await expect(home).toHaveCount(mode === 'enabled' ? 1 : 0)
      await expect(page.getByTestId('release-footer')).toHaveCount(1)
      expect(regionGets).toBe(beforeReturningHome)
      expect(
        (await page.context().cookies()).filter(cookie =>
          /home.*(?:variant|cohort|experiment)/i.test(cookie.name)
        )
      ).toEqual([])
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth
        )
      ).toBe(false)
    })
  }
})
