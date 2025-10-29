import { expect } from '../fixtures'
import type { Locator, Page } from '@playwright/test'

export class Header {
  readonly page: Page
  readonly root: Locator
  readonly menuButton: Locator
  readonly searchToggle: Locator
  readonly themeToggle: Locator
  readonly overlay: Locator
  readonly sideNav: Locator
  readonly closeMenuButton: Locator
  readonly mobileLogo: Locator
  readonly desktopLogo: Locator
  readonly date: Locator

  constructor(page: Page) {
    this.page = page
    // Use the first <header> on the page as the site header
    this.root = page.locator('header').first()

    // Primary controls
    // Menu button (has aria-label in Spanish and class `menu`)
    this.menuButton = this.root
      .locator('button.menu')
      .first()
      .or(page.getByRole('button', { name: /menú/i }))
    this.searchToggle = page.getByRole('button', { name: /toggle search/i })
    this.themeToggle = page.getByRole('button', { name: /toggle theme/i })

    // Side nav elements
    this.overlay = page.locator('button.link-menu-button-open')
    this.sideNav = page.locator('aside.fixed').first()
    this.closeMenuButton = page.getByRole('button', {
      name: /cerrar menú/i
    })

    // Logos
    this.mobileLogo = page.locator('span.md\\:hidden a.link-logo')
    this.desktopLogo = page.locator('span.hidden.md\\:block a.link-logo')

    // Date snippet in header (when visible on desktop)
    this.date = this.root.locator('time').first()
  }

  async expectVisible() {
    await expect(this.root).toBeVisible()
    // Menu buttons can exist twice (mobile + desktop). Ensure at least one exists and one is visible.
    const menuCount = await this.menuButton.count()
    expect(menuCount).toBeGreaterThan(0)
    let anyVisible = false
    for (let i = 0; i < menuCount; i += 1) {
      if (await this.menuButton.nth(i).isVisible()) {
        anyVisible = true
        break
      }
    }
    expect(anyVisible).toBeTruthy()
    await expect(this.searchToggle).toBeVisible()
    await expect(this.themeToggle).toBeVisible()
    // At least one logo visible depending on viewport
    const logos = [this.mobileLogo, this.desktopLogo]
    let logoVisible = false
    for (const loc of logos) {
      if (await loc.first().isVisible()) {
        logoVisible = true
        break
      }
    }
    expect(logoVisible).toBeTruthy()
  }
}
