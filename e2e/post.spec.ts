import './polyfills'
import { test, expect } from './fixtures'
import { env } from './utils/env'

test.describe('Single Post Page', () => {
  test('Full Post Content Validation', async ({ page }) => {
    if (!env.postPath) return // E2E_POST_PATH not set
    await page.goto(env.postPath!)

    if (env.postTitle) {
      const title = await page.title()
      expect(title.toLowerCase()).toContain(env.postTitle.toLowerCase())
    }

    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toBeVisible()
    if (env.postTitle) {
      const h1Text = await h1.textContent()
      expect((h1Text || '').toLowerCase()).toContain(
        env.postTitle.toLowerCase()
      )
    }

    // date element
    await expect(page.locator('time').first()).toBeVisible()

    // main body must contain paragraphs
    const main = page.getByRole('main')
    const pCount = await main.locator('p').count()
    expect(pCount).toBeGreaterThan(0)

    // main post image should be visible
    await expect(main.locator('img').first()).toBeVisible()
  })
})
