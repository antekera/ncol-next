import { test, expect } from './fixtures'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runInNewContext } from 'node:vm'

// Run against an isolated production build; this never changes deployment flags.
const mode = process.env.HOME_V2_RELEASE_E2E
test.describe('Home public release and rollback', () => {
  test.skip(
    !['enabled', 'rollback'].includes(mode ?? ''),
    'Requires a release build'
  )

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
      await page.route(
        /googletagmanager\.com|google-analytics\.com|analytics\.google\.com|googlesyndication\.com|doubleclick\.net|ingest\.sentry\.io|\/api\/track(?:\?|$)/,
        route => route.fulfill({ status: 204 })
      )
      await page.route(/\/rest\/v1\/ads(?:\?|$)/, route =>
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
      await page.route(/\/rest\/v1\/ad_slot_fallbacks_public(?:\?|$)/, route =>
        route.fulfill({ json: [] })
      )
      const response = await page.goto('/')
      expect(response?.status()).toBe(200)
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
      const home = page.locator('[data-home-variant="v2"]')
      if (mode === 'enabled') {
        await expect(home).toHaveCount(1)
        await expect(home.getByRole('heading', { level: 1 })).toHaveCount(1)
        await expect(
          home.locator('section[data-module-id="opening"]')
        ).toHaveCount(1)
        await expect(home.getByTestId('release-footer')).toHaveCount(1)
        if (width >= 768) {
          for (const sidebar of await home.locator('aside[aria-label]').all()) {
            expect((await sidebar.boundingBox())!.width).toBeGreaterThanOrEqual(
              300
            )
          }
        }
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
      await expect(page.getByTestId('release-footer')).toHaveCount(1)
      await expect(
        page.locator('main').getByTestId('release-footer')
      ).toHaveCount(0)
      await page.goto('/?__ncol_home_audit=v2&__ncol_home_measurement=1')
      await expect(home).toHaveCount(mode === 'enabled' ? 1 : 0)
      await expect(page.getByTestId('release-footer')).toHaveCount(1)
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
