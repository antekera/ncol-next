import { test, expect } from './fixtures'

const publicHome = process.env.HOME_V2_RELEASE_E2E === 'enabled'
const environment = publicHome
  ? (process.env.HOME_V2_VITALS_ENVIRONMENT_E2E ?? 'production')
  : 'local-qa'

// Native browser metrics only. This bridge observes the existing dataLayer in
// the test process so the final visibility-hidden reports survive navigation.
// It is not a product transport and does not replace PerformanceObserver.
test.describe('Native Home Web Vitals through the existing dataLayer', () => {
  test.skip(
    !publicHome && process.env.HOME_V2_MEASUREMENT_E2E !== 'true',
    'Requires a public Home build or explicit local QA build'
  )
  for (const variant of publicHome ? ['v2'] : ['control', 'v2']) {
    for (const width of [390, 1440]) {
      test(`${variant} ${width}px: document metrics retain the original Home after an article navigation`, async ({
        page,
        browserName
      }, testInfo) => {
        test.skip(
          browserName !== 'chromium',
          'Native INP/LCP proof uses Chromium'
        )
        const captured: Record<string, unknown>[] = []
        await page.exposeBinding('captureHomeVital', (_, value) => {
          captured.push(value)
        })
        await page.addInitScript(() => {
          const layer = (window.dataLayer ??= [])
          const push = layer.push.bind(layer)
          layer.push = (...items) => {
            for (const item of items)
              if ('event' in item && item.event === 'WEB_VITAL')
                void (
                  window as typeof window & {
                    captureHomeVital: (value: unknown) => Promise<void>
                  }
                ).captureHomeVital(item)
            return push(...items)
          }
        })
        await page
          .context()
          .route(
            /googletagmanager\.com|google-analytics\.com|analytics\.google\.com|googlesyndication\.com|doubleclick\.net|ingest\.sentry\.io|\/api\/track(?:\?|$)/,
            route => route.fulfill({ status: 204 })
          )
        await page.route(
          /\/rest\/v1\/(?:ads|ad_slot_fallbacks_public)(?:\?|$)/,
          route => route.fulfill({ status: 200, json: [] })
        )
        await page.setViewportSize({ width, height: 1000 })
        await page.goto(
          publicHome
            ? '/'
            : `/?__ncol_home_audit=${variant}&__ncol_home_measurement=1`
        )
        if (publicHome) {
          await expect(page.locator('body')).not.toHaveAttribute(
            'data-home-measurement-qa'
          )
          await expect(page.locator('body')).toHaveAttribute(
            'data-home-vitals-environment',
            environment
          )
        }
        const root = page.locator(`[data-home-variant="${variant}"]`)
        const heading = root.getByRole('heading', { level: 1 })
        await expect(heading).toBeVisible()
        await expect
          .poll(() =>
            page.evaluate(() =>
              (window.dataLayer ?? []).some(
                item =>
                  'event' in item &&
                  item.event === 'CUSTOM_PAGE_VIEW' &&
                  'home_view_id' in item
              )
            )
          )
          .toBe(true)
        const homeView = (await page.evaluate(() =>
          (window.dataLayer ?? []).find(
            item => 'event' in item && item.event === 'CUSTOM_PAGE_VIEW'
          )
        )) as Record<string, unknown>
        const capabilities = await page.evaluate(
          () => PerformanceObserver.supportedEntryTypes
        )
        expect(capabilities).toContain('largest-contentful-paint')
        expect(capabilities).toContain('event')
        await page.getByRole('button', { name: /toggle search/i }).click()
        await page.waitForTimeout(400)
        const card = root.locator('[data-article-id]').first()
        await (
          variant === 'control'
            ? card.locator('h1 a')
            : card.locator('a').first()
        ).click()
        await expect(page).toHaveURL(/\/[^/]+\/\d{2}\/\d{2}\/[^/]+\//)
        await page.waitForTimeout(400)
        // A real document navigation emits native visibilitychange/pagehide;
        // no synthetic metric callback or lifecycle event is dispatched.
        await page.goto('about:blank')
        await expect
          .poll(() =>
            [...new Set(captured.map(item => item.web_vital_name))].sort()
          )
          .toEqual(['CLS', 'INP', 'LCP'])
        expect(
          captured.every(
            item =>
              item.home_view_id === homeView.home_view_id &&
              item.home_version ===
                (variant === 'control' ? 'current' : 'v2') &&
              item.opening_treatment === homeView.opening_treatment &&
              item.web_vital_environment === environment &&
              item.web_vital_scope === 'document' &&
              typeof item.web_vital_value === 'number' &&
              Number.isFinite(item.web_vital_value) &&
              item.web_vital_value >= 0
          )
        ).toBe(true)
        const keys = captured.map(item =>
          JSON.stringify([item.web_vital_id, item.web_vital_revision])
        )
        expect(new Set(keys).size).toBe(keys.length)
        expect(JSON.stringify(captured)).not.toMatch(
          /navigationURL|entries|private_query/
        )
        await testInfo.attach('native-vitals.json', {
          body: JSON.stringify(
            { variant, width, capabilities, samples: captured },
            null,
            2
          ),
          contentType: 'application/json'
        })
      })
    }
  }
})
