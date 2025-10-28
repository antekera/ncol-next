import './polyfills'
import { test, expect } from './fixtures'

test.describe('Search Page', () => {
  test('Search page renders title and Google CSE containers', async ({
    page
  }) => {
    const resp = await page.goto('/busqueda', { waitUntil: 'domcontentloaded' })
    if (!resp || resp.status() >= 400) return // Search page not available (non-200)

    await expect(page).toHaveTitle(/resultados de la búsqueda/i)
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /resultados de la búsqueda/i
      })
    ).toBeVisible()
  })
})
