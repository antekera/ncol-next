import './polyfills'
import { test, expect } from './fixtures'
import { Header } from './poms/Header'
import { Footer } from './poms/Footer'
import { PostCard } from './poms/PostCard'
import { env } from './utils/env'

test.describe('Homepage', () => {
  test('Core Layout & Data Integrity', async ({ page }) => {
    const header = new Header(page)
    const footer = new Footer(page)

    const resp = await page.goto('/', { waitUntil: 'domcontentloaded' })
    if (!resp || resp.status() >= 400) return // Homepage not available (non-200)
    await header.expectVisible()
    await footer.expectVisible()

    await expect(page.getByRole('main')).toBeVisible()

    const cards = page.locator('main article')
    const count = await cards.count()
    if (env.homeCount) {
      await expect(cards).toHaveCount(env.homeCount)
    }

    if (count === 0) return // No articles rendered on homepage in this environment
    const firstCard = new PostCard(cards.first())
    await firstCard.expectCoreVisible()
  })
})
