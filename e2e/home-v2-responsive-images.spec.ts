import { test, expect } from './fixtures'
import { declaredImageWidth } from './utils/image-sizes'

test.describe('Home V2 editorial images follow their real columns', () => {
  test.skip(
    process.env.HOME_V2_E2E !== 'true',
    'Requires the local preview build'
  )
  for (const width of [320, 390, 767, 768, 900, 1023, 1024, 1199, 1440]) {
    test(`${width}px: responsive image declarations match the rendered cards`, async ({
      page
    }, info) => {
      await page.setViewportSize({ width, height: 1000 })
      await page.route(
        /google-analytics\.com\/.*collect|analytics\.google\.com\/.*collect|\/api\/track(?:\?|$)/,
        r => r.fulfill({ status: 204 })
      )
      await page.goto('/home-v2-preview/')
      const targets = [
        ['opening', 2],
        ['zulia', 1],
        ['zulia', 2],
        ['nacionales', 1],
        ['sucesos', 1],
        ['internacionales', 1],
        ['deportes', 1],
        ['tendencias', 1],
        ['entretenimiento', 1],
        ['videos', 1]
      ] as const
      const measurements = []
      for (const [moduleId, position] of targets) {
        const card = page.locator(
          `section[data-module-id="${moduleId}"] article[data-item-position="${position}"]`
        )
        await card.scrollIntoViewIfNeeded()
        const image = card.locator('picture img')
        await expect(image).toBeAttached()
        const value = await declaredImageWidth(image)
        measurements.push({ moduleId, position, ...value })
        expect(
          Math.abs(value.declared - value.actual),
          `${moduleId}/${position} sizes versus CSS width`
        ).toBeLessThan(1)
      }
      await info.attach('responsive-editorial-widths', {
        contentType: 'application/json',
        body: JSON.stringify({ width, measurements })
      })
    })
  }
})
