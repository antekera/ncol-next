import { test, expect } from './fixtures'

test.describe('Native sticky creative readiness', () => {
  test.skip(
    process.env.HOME_V2_AUDIT_E2E !== 'true',
    'Requires the local root performance-audit server'
  )

  for (const variant of ['control', 'v2']) {
    for (const width of [390, 1440]) {
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
