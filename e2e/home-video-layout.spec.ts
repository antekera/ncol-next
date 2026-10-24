import { test, expect } from './fixtures'

test.describe('Shared video carousel loading geometry', () => {
  test.skip(
    process.env.HOME_V2_VIDEO_E2E !== 'true',
    'Requires the local preview build'
  )
  for (const variant of ['control', 'v2']) {
    for (const width of [390, 1440]) {
      test(`${variant} ${width}px reserves the carousel before its chunk arrives`, async ({
        page,
        context
      }) => {
        await page.setViewportSize({ width, height: 900 })
        await context.route(
          /googletagmanager\.com|google-analytics\.com|analytics\.google\.com|googlesyndication\.com|doubleclick\.net|\/api\/track(?:\?|$)/,
          route => route.fulfill({ status: 204 })
        )
        await context.route(
          /\/rest\/v1\/(?:ads|ad_slot_fallbacks_public)(?:\?|$)/,
          route => route.fulfill({ json: [] })
        )
        let held = false
        let release = () => {}
        const gate = new Promise<void>(resolve => {
          release = resolve
        })
        await context.route('**/_next/static/chunks/**', async route => {
          if (!new URL(route.request().url()).pathname.endsWith('.js'))
            return route.continue()
          const response = await route.fetch()
          const body = await response.text()
          if (body.includes('Carrusel de videos actuales')) {
            held = true
            await gate
          }
          await route.fulfill({ response, body })
        })
        try {
          await page.goto(
            `/?__ncol_home_audit=${variant}&__ncol_home_measurement=1`,
            { waitUntil: 'domcontentloaded' }
          )
          const root = page.locator(`[data-home-variant="${variant}"]`)
          await expect(root.getByRole('heading', { level: 1 })).toBeVisible()
          await page.evaluate(() => document.fonts.ready)
          const skeleton = root.locator(
            '.animate-pulse:has(.mobile-centered-carousel):visible'
          )
          await expect(skeleton).toBeVisible()
          await skeleton.scrollIntoViewIfNeeded()
          await expect.poll(() => held).toBe(true)
          const before = (await skeleton.boundingBox())!
          expect(before.height).toBeGreaterThan(0)
          release()
          const carousel = root.locator('section[data-module-id="videos"]')
          await expect(
            carousel.getByRole('region', {
              name: 'Carrusel de videos actuales'
            })
          ).toBeAttached()
          const after = (await carousel.boundingBox())!
          expect(Math.abs(after.height - before.height)).toBeLessThanOrEqual(2)
          const frame = await carousel
            .locator('[data-article-id] > div')
            .first()
            .boundingBox()
          expect(frame).not.toBeNull()
          expect(
            Math.abs(frame!.height - (frame!.width * 9) / 16)
          ).toBeLessThanOrEqual(1)
        } finally {
          release()
        }
      })
    }
  }
})
