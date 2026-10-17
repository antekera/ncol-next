import { test, expect } from './fixtures'

test.describe('Home V2 traditional opening', () => {
  test.skip(
    process.env.HOME_V2_TRADITIONAL_E2E !== 'true',
    'Requires the local server with HOME_V2_PREVIEW_TREATMENT=traditional'
  )

  for (const width of [390, 900, 1440]) {
    test(`uses the automatic no-image treatment at ${width}px`, async ({
      page
    }, info) => {
      await page.setViewportSize({ width, height: 900 })
      const attempts: string[] = []
      page.on('request', request => {
        if (
          /googletagmanager\.com|google-analytics\.com|\/api\/track(?:\?|$)/.test(
            request.url()
          )
        )
          attempts.push(new URL(request.url()).hostname)
      })
      await page.route(
        /google-analytics\.com\/.*collect|analytics\.google\.com\/.*collect|\/api\/track(?:\?|$)/,
        route => route.fulfill({ status: 204 })
      )
      const response = await page.goto('/home-v2-preview/')
      expect(response?.status()).toBe(200)
      const home = page.locator('[data-home-variant="v2"]')
      const opening = home.locator('section[data-module-id="opening"]')
      await expect(opening).toHaveAttribute(
        'data-opening-treatment',
        'traditional'
      )
      await expect(opening).toHaveAttribute(
        'data-initial-treatment',
        'traditional'
      )
      await expect(home.getByRole('heading', { level: 1 })).toHaveCount(1)
      await expect(home.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(opening.locator('img[data-home-critical]')).toHaveCount(0)
      await expect(
        opening.locator('article[data-component-type="hero"] picture')
      ).toHaveCount(0)
      if (width >= 1024)
        expect((await opening.boundingBox())!.height).toBeLessThan(360)
      const secondary = opening
        .locator('article[data-component-type="compact_card"] picture')
        .first()
      await expect(secondary.locator('source')).toHaveAttribute('sizes', '92px')
      expect((await secondary.boundingBox())!.width).toBeCloseTo(92, 0)
      await expect(page.locator('link[rel="preload"][as="image"]')).toHaveCount(
        0
      )
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        )
      ).toBe(true)
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        'content',
        'noindex, nofollow'
      )
      await expect(
        home.locator('section[data-module-id="nacionales"]')
      ).toBeVisible()
      expect(attempts).toEqual([])
      await info.attach(`home-traditional-${width}`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png'
      })
    })
  }
})
