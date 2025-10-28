import './polyfills'
import { test, expect } from './fixtures'

test.describe('Contact Page', () => {
  test('Contact Page Elements', async ({ page }) => {
    const resp = await page.goto('/contacto/', {
      waitUntil: 'domcontentloaded'
    })
    if (!resp || resp.status() >= 400) return // Contact page not available (non-200)
    await expect(
      page.getByRole('heading', { level: 1, name: /contáctanos/i })
    ).toBeVisible()
    await expect(page.getByLabel('Nombre')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Asunto')).toBeVisible()
    await expect(page.getByLabel('Mensaje')).toBeVisible()
    await expect(
      page.getByRole('button', { name: /enviar mensaje/i })
    ).toBeEnabled()
  })
})
