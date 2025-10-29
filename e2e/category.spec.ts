import './polyfills'
import { test, expect } from './fixtures'
import { env } from './utils/env'

test.describe('Category Page', () => {
  test('Category Page Validation', async ({ page }) => {
    if (!env.categorySlug) return // E2E_CATEGORY_SLUG not set
    await page.goto(`/categoria/${env.categorySlug}`)

    const title = await page.title()
    expect(title.toLowerCase()).toContain(env.categorySlug!.toLowerCase())

    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toBeVisible()
    const h1Text = await h1.textContent()
    expect((h1Text || '').toLowerCase()).toContain(
      env.categorySlug!.toLowerCase()
    )

    const posts = page.locator('main article')
    if (env.categoryCount) {
      await expect(posts).toHaveCount(env.categoryCount)
    } else {
      await expect(posts.first()).toBeVisible()
    }
  })
})

test.describe('Tag Page', () => {
  test('Tag Page Validation', async ({ page }) => {
    if (!env.tagSlug) return // E2E_TAG_SLUG not set
    await page.goto(`/etiqueta/${env.tagSlug}`)

    const title2 = await page.title()
    expect(title2.toLowerCase()).toContain(env.tagSlug!.toLowerCase())
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toBeVisible()
    const h1Text2 = await h1.textContent()
    expect((h1Text2 || '').toLowerCase()).toContain(env.tagSlug!.toLowerCase())

    const posts = page.locator('main article')
    if (env.tagCount) {
      await expect(posts).toHaveCount(env.tagCount)
    } else {
      await expect(posts.first()).toBeVisible()
    }
  })
})
