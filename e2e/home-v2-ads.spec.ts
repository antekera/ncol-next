import { test, expect } from './fixtures'

test.describe('Native sticky creative readiness', () => {
  test.skip(
    process.env.HOME_V2_AUDIT_E2E !== 'true',
    'Requires the local root performance-audit server'
  )

  for (const variant of ['control', 'v2']) {
    for (const width of [390, 1440]) {
      test(`${variant} at ${width}px renders a direct creative before optional fallback configuration`, async ({
        page
      }) => {
        await page.setViewportSize({ width, height: 900 })
        await page.route(
          /google-analytics\.com\/.*collect|analytics\.google\.com\/.*collect|\/api\/track(?:\?|$)/,
          route => route.fulfill({ status: 204 })
        )
        let release = () => {}
        const held = new Promise<void>(resolve => {
          release = resolve
        })
        let configurationRequests = 0
        let directRequests = 0
        let imageRequests = 0
        let requestedSlots = ''
        await page.route(/\/rest\/v1\/ads(?:\?|$)/, route => {
          directRequests++
          return route.fulfill({
            status: 200,
            json: [
              {
                id: 'home-qa-immediate',
                type: 'banner',
                slot: 'sticky-bottom',
                device_target: 'all',
                image_url: 'http://localhost:3212/__immediate-ad.svg',
                image_url_mobile: 'http://localhost:3212/__immediate-ad.svg',
                html_content: null,
                link_url: 'https://www.noticiascol.com/dolar-hoy/'
              }
            ]
          })
        })
        await page.route(
          /\/rest\/v1\/ad_slot_fallbacks_public(?:\?|$)/,
          async route => {
            configurationRequests++
            requestedSlots =
              new URL(route.request().url()).searchParams.get('slot') ?? ''
            await held
            await route.fulfill({
              status: 200,
              json: [
                {
                  slot: 'sidebar',
                  provider: 'third_party',
                  provider_key: 'clever',
                  container_class: 'qa-late-fallback',
                  unit_id: null
                }
              ]
            })
          }
        )
        await page.route('**/__immediate-ad.svg', route => {
          imageRequests++
          return route.fulfill({
            status: 200,
            contentType: 'image/svg+xml',
            body: '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100"><rect width="100%" height="100%" fill="#117dbb"/></svg>'
          })
        })
        try {
          await page.goto(`/?__ncol_home_audit=${variant}`, {
            waitUntil: 'domcontentloaded'
          })
          await expect.poll(() => configurationRequests).toBe(1)
          const image = page.locator('img[src$="/__immediate-ad.svg"]')
          await expect(image).toBeVisible()
          await image.evaluate(element =>
            (element as HTMLImageElement).decode()
          )
          await expect(
            page.getByLabel('Cerrar anuncio', { exact: true })
          ).toBeVisible()
          expect(requestedSlots).not.toContain('sticky-bottom')
          expect(requestedSlots).toContain('sidebar')
          await expect(page.locator('.qa-late-fallback')).toHaveCount(0)
          const views = () =>
            page.evaluate(() =>
              Object.keys(localStorage)
                .filter(key => key.startsWith('ncol_v_home-qa-immediate_'))
                .map(key => localStorage.getItem(key))
            )
          await expect.poll(views).toEqual(['1'])
          release()
          await expect(page.locator('.qa-late-fallback').first()).toBeAttached()
          await page.waitForTimeout(450)
          expect(await views()).toEqual(['1'])
          expect(directRequests).toBe(1)
          expect(configurationRequests).toBe(1)
          expect(imageRequests).toBe(1)
        } finally {
          release()
        }
      })
      test(`${variant} at ${width}px loads one creative before controls and counters`, async ({
        page
      }) => {
        await page.setViewportSize({ width, height: 900 })
        await page.route(
          /google-analytics\.com\/.*collect|analytics\.google\.com\/.*collect|\/api\/track(?:\?|$)/,
          route => route.fulfill({ status: 204 })
        )
        await page.route(
          /\/rest\/v1\/ad_slot_fallbacks_public(?:\?|$)/,
          route => route.fulfill({ status: 200, json: [] })
        )
        await page.route(/\/rest\/v1\/ads(?:\?|$)/, route =>
          route.fulfill({
            status: 200,
            json: [
              {
                id: 'home-qa-sticky',
                type: 'banner',
                image_url: 'http://localhost:3212/__home-sticky-desktop.svg',
                image_url_mobile:
                  'http://localhost:3212/__home-sticky-mobile.svg',
                html_content: null,
                link_url: 'https://www.noticiascol.com/dolar-hoy/',
                slot: 'sticky-bottom',
                device_target: 'all'
              }
            ]
          })
        )
        let release = () => {}
        const held = new Promise<void>(resolve => {
          release = resolve
        })
        let requests = 0
        await page.route(
          /\/__home-sticky-(?:desktop|mobile)\.svg/,
          async route => {
            requests++
            await held
            const mobile = route.request().url().includes('mobile')
            await route.fulfill({
              status: 200,
              contentType: 'image/svg+xml',
              body: `<svg xmlns="http://www.w3.org/2000/svg" width="${mobile ? 300 : 730}" height="${mobile ? 137 : 140}"><rect width="100%" height="100%" fill="#117dbb"/></svg>`
            })
          }
        )
        try {
          const response = await page.goto(`/?__ncol_home_audit=${variant}`, {
            waitUntil: 'domcontentloaded'
          })
          expect(response?.status()).toBe(200)
          await expect(page.locator('[data-home-variant="v2"]')).toHaveCount(
            variant === 'v2' ? 1 : 0
          )
          await expect.poll(() => requests).toBe(1)
          const image = page.locator('img[src*="/__home-sticky-"]')
          const close = page.getByLabel('Cerrar anuncio', { exact: true })
          await expect(image).toHaveCount(1)
          await expect(close).toBeHidden()
          // Longer than the existing native counter's 300 ms timer: a blank
          // creative must not be counted as a displayed ad.
          await page.waitForTimeout(450)
          const views = () =>
            page.evaluate(() =>
              Object.keys(localStorage)
                .filter(key => key.startsWith('ncol_v_home-qa-sticky_'))
                .map(key => localStorage.getItem(key))
            )
          expect(await views()).toEqual([])
          release()
          await image.evaluate(element =>
            (element as HTMLImageElement).decode()
          )
          await expect(close).toBeVisible()
          const bounds = await image.boundingBox()
          expect(bounds?.width).toBe(width === 390 ? 300 : 730)
          expect(bounds?.height).toBe(width === 390 ? 137 : 140)
          await expect.poll(views).toEqual(['1'])
          expect(requests).toBe(1)
          await close.click()
          await expect(image).toHaveCount(0)
          expect(await views()).toEqual(['1'])
        } finally {
          release()
          // Keep collector interception until Playwright disposes the context.
        }
      })
    }
  }
})
