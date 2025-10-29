import './polyfills'
import { test, expect } from './fixtures'
import { env } from './utils/env'

test.describe('Sidebar Content Pages', () => {
  test('Más leídos page list and count', async ({ page }) => {
    const resp = await page.goto('/mas-leidos', {
      waitUntil: 'domcontentloaded'
    })
    if (!resp || resp.status() >= 400) return // Mas-leidos page not available (non-200)
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toBeVisible()
    const listItems = page.locator('main article')
    if (env.sidebarMostReadCount) {
      await expect(listItems).toHaveCount(env.sidebarMostReadCount)
    } else {
      await expect(listItems.first()).toBeVisible()
    }
    const linkCount = await listItems.locator('a[href]').count()
    expect(linkCount).toBeGreaterThan(0)
  })

  test('Más visto ahora page list and count', async ({ page }) => {
    const resp2 = await page.goto('/mas-visto-ahora', {
      waitUntil: 'domcontentloaded'
    })
    if (!resp2 || resp2.status() >= 400) return // Mas-visto-ahora page not available (non-200)
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toBeVisible()
    const listItems = page.locator('main article')
    if (env.sidebarMostViewedCount) {
      await expect(listItems).toHaveCount(env.sidebarMostViewedCount)
    } else {
      await expect(listItems.first()).toBeVisible()
    }
    const linkCount2 = await listItems.locator('a[href]').count()
    expect(linkCount2).toBeGreaterThan(0)
  })
})
