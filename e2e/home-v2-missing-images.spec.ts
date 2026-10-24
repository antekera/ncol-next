import { test, expect } from './fixtures'

// Presentation fixture only: null/invalid HomeImage returns no picture (unit
// contract). Remove that node after loading to exercise the same CSS structure
// with real editorial text, without CMS writes or performance claims.
test.describe('Compact cards without editorial images', () => {
  test.skip(process.env.HOME_V2_E2E !== 'true', 'Local preview build only')
  for (const width of [390, 1440]) {
    test(`missing compact thumbnails preserve full text width at ${width}px`, async ({
      page
    }) => {
      await page.setViewportSize({ width, height: 1000 })
      await page.goto('/home-v2-preview/')
      for (const module of ['opening', 'zulia']) {
        const card = page.locator(
          `section[data-module-id="${module}"] article[data-item-position="2"]`
        )
        await card.scrollIntoViewIfNeeded()
        const picture = card.locator('picture')
        await expect(picture.locator('img')).toBeAttached()
        await picture.evaluate(node => node.remove())
        const link = card.locator('a').first()
        const copy = link.locator('div').first()
        await expect
          .poll(async () => (await copy.boundingBox())!.width)
          .toBeCloseTo((await link.boundingBox())!.width, 0)
        await expect(card.getByRole('heading')).toBeVisible()
      }
    })
  }
})
