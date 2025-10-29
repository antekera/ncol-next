import { expect } from '../fixtures'
import type { Locator, Page } from '@playwright/test'

export class Sidebar {
  readonly root: Locator
  constructor(page: Page) {
    this.root = page.locator('aside')
  }
  async expectVisible() {
    await expect(this.root).toBeVisible()
  }
}
