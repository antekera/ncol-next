import { expect } from '../fixtures'
import type { Locator, Page } from '@playwright/test'

export class Footer {
  readonly page: Page
  readonly root: Locator
  readonly goTopButton: Locator
  readonly logoLink: Locator
  readonly description: Locator
  readonly facebookLink: Locator
  readonly xLink: Locator
  readonly instagramLink: Locator
  readonly threadsLink: Locator
  readonly footerLinks: Locator
  readonly bottomBar: Locator
  readonly termsLink: Locator
  readonly privacyLink: Locator

  constructor(page: Page) {
    this.page = page
    // Footer root
    this.root = page
      .locator('footer.footer')
      .first()
      .or(page.getByRole('contentinfo'))
    // Go to top
    this.goTopButton = this.root.locator('[data-testid="button-go-top"]')
    // Brand logo in footer
    this.logoLink = this.root.locator('a.link-logo')
    // Short description text
    this.description = this.root.locator('h6')
    // Social links by title attributes
    this.facebookLink = this.root.locator('a[title="Síguenos en Facebook"]')
    this.xLink = this.root.locator('a[title="Síguenos en X"]')
    this.instagramLink = this.root.locator('a[title="Síguenos en Instagram"]')
    this.threadsLink = this.root.locator('a[title="Síguenos en Threads"]')
    // Footer navigation links (columns)
    this.footerLinks = this.root.locator('a.link-footer')
    // Bottom bar with legal links (avoid matching the go-top button which also uses bg-primary)
    this.bottomBar = this.root
      .locator('div.bg-primary:has(a.link-bottom-bar)')
      .first()
    this.termsLink = this.bottomBar.getByRole('link', {
      name: /t[eé]rminos y condiciones/i
    })
    this.privacyLink = this.bottomBar.getByRole('link', { name: /privacidad/i })
  }

  async expectVisible() {
    await expect(this.root).toBeVisible()
    await expect(this.goTopButton).toBeVisible()
    await expect(this.logoLink).toBeVisible()
    await expect(this.description).toBeVisible()

    // Social links should be present
    await expect(this.facebookLink).toBeVisible()
    await expect(this.xLink).toBeVisible()
    await expect(this.instagramLink).toBeVisible()
    await expect(this.threadsLink).toBeVisible()

    // Some footer links (category pages, etc.) should exist
    const footerLinkCount = await this.footerLinks.count()
    expect(footerLinkCount).toBeGreaterThan(0)

    // Verify the key footer navigation links by visible text
    const mustHaveLinks = [
      /Noticias del Zulia/i,
      /Noticias Nacionales/i,
      /Noticias Internacionales/i,
      /Noticias de Deportes/i,
      /Noticias de Tendencias/i,
      /Noticias de Entretenimiento/i,
      /Noticias de Salud/i,
      /Noticias de Sucesos/i,
      /Contacto/i
    ]
    for (const re of mustHaveLinks) {
      await expect(
        this.footerLinks.filter({ hasText: re }).first()
      ).toBeVisible()
    }

    // Bottom bar legal links
    await expect(this.bottomBar).toBeVisible()
    await expect(this.termsLink).toBeVisible()
    await expect(this.privacyLink).toBeVisible()
    await expect(this.bottomBar).toContainText(/Mas Multimedios/i)
  }
}
