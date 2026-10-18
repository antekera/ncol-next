import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { test, expect } from './fixtures'

// Locate the compiled form by its public UI text, rather than pinning a chunk ID.
function formChunks(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) return formChunks(path)
    return entry.name.endsWith('.js') &&
      readFileSync(path, 'utf8').includes('Ingresa tu correo')
      ? [path.split('/.next/')[1]]
      : []
  })
}

test.describe('Access form on demand', () => {
  test.skip(
    process.env.HOME_V2_LOGIN_E2E !== 'true',
    'Requires a current local production build'
  )
  for (const { variant, width } of ['control', 'v2'].flatMap(variant =>
    [390, 1440].map(width => ({ variant, width }))
  )) {
    test(`${variant} at ${width}px downloads the form only when opened and preserves registration/reset`, async ({
      page
    }) => {
      await page.setViewportSize({ width, height: 900 })
      const chunks = formChunks(resolve('.next/static/chunks'))
      expect(chunks.length).toBeGreaterThan(0)
      const requested: string[] = []
      page.on('request', request =>
        requested.push(new URL(request.url()).pathname)
      )
      await page.route(
        /google-analytics\.com\/.*collect|analytics\.google\.com\/.*collect|\/api\/track(?:\?|$)/,
        route => route.fulfill({ status: 204 })
      )
      await page.goto(`/?__ncol_home_audit=${variant}`)
      const access = page
        .getByRole('button', { name: 'Iniciar sesión', exact: true })
        .first()
      await expect(access).toBeVisible()
      expect(
        requested.some(path => chunks.some(chunk => path === `/_next/${chunk}`))
      ).toBe(false)
      const dialog = page.getByRole('dialog')
      let release!: () => void
      const held = new Promise<void>(resolve => {
        release = resolve
      })
      await page.route(
        url => chunks.some(chunk => url.pathname === `/_next/${chunk}`),
        async route => {
          await held
          await route.continue()
        }
      )
      await access.focus()
      await access.press('Enter')
      try {
        await expect(
          page
            .getByRole('status', { name: '' })
            .filter({ hasText: 'Cargando acceso' })
        ).toBeVisible()
        await expect(
          page.locator('[data-home-occluder="login-loading"]')
        ).toBeVisible()
        await page
          .getByRole('button', { name: 'Cancelar', exact: true })
          .click()
        await expect(dialog).toHaveCount(0)
        await expect(access).toBeFocused()
      } finally {
        release()
      }
      await access.focus()
      await access.press('Enter')
      await expect(
        dialog.getByRole('heading', { name: 'Inicia sesión', exact: true })
      ).toBeVisible()
      expect(
        requested.some(path => chunks.some(chunk => path === `/_next/${chunk}`))
      ).toBe(true)
      // The external security widget can resize after pointer targeting.
      // Exercise the same native registration action through keyboard focus.
      const register = dialog.getByRole('button', { name: /Regístrate/ })
      await register.focus()
      await register.press('Enter')
      await expect(
        dialog.getByRole('heading', { name: 'Crear cuenta' })
      ).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(dialog).toHaveCount(0)
      await expect(access).toBeFocused()
      await access.press('Enter')
      await expect(
        dialog.getByRole('heading', { name: 'Inicia sesión', exact: true })
      ).toBeVisible()
      await page.keyboard.press('Escape')
    })
  }
})
