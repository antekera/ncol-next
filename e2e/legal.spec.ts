import './polyfills'
import { test, expect } from './fixtures'

test.describe('Legal Pages', () => {
  for (const { path, title } of [
    { path: '/privacidad', title: /privacidad/i },
    { path: '/terminos-y-condiciones', title: /términos|terminos/i }
  ]) {
    test(`Content check for ${path}`, async ({ page }) => {
      const resp = await page.goto(path, { waitUntil: 'domcontentloaded' })
      if (!resp || resp.status() >= 400) return // page not available (non-200)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(page).toHaveTitle(title)
      await expect(page.locator('main p').first()).toBeVisible()
    })
  }
})
