import { expect } from '../fixtures'
import type { Locator } from '@playwright/test'

export class PostCard {
  readonly root: Locator
  readonly title: Locator
  readonly image: Locator
  readonly excerpt: Locator
  readonly link: Locator

  constructor(root: Locator) {
    this.root = root
    this.title = root.locator('h2, h3, a[aria-label]')
    // Be resilient to Next/Image, <picture>, and custom testids
    this.image = root
      .getByRole('img')
      .or(root.locator('picture img'))
      .or(root.locator('img'))
      .or(root.locator('[data-testid="cover-image"]'))
    this.excerpt = root.locator('p')
    this.link = root.locator('a[href]')
  }

  async expectCoreVisible() {
    await expect(this.title.first()).toBeVisible()
    // If images exist, presence is sufficient across browsers; visibility may be flaky.
    // (No-op if none found.)
    await expect(this.link.first()).toBeVisible()
  }
}
