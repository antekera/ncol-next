import './polyfills'
import { test, expect } from './fixtures'

test.describe('Dolar Hoy Page', () => {
  test('Should render Dolar Hoy page with Calculator', async ({ page }) => {
    // Listen to browser console logs
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()))
    page.on('pageerror', err => console.log('BROWSER ERROR:', err))

    // Monitor all requests to debug
    await page.route('**', async route => {
      const request = route.request()
      const url = request.url()
      // console.log('Request: ' + url)
      if (url.includes('/api/dolar/')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'oficial',
              source: 'Banco Central de Venezuela',
              price: 36.5,
              last_update: new Date().toISOString(),
              fetched_at: new Date().toISOString()
            }
          ])
        })
        return
      }
      await route.continue()
    })

    // Navigate to the Dolar Hoy page and wait for network activity to settle
    await page.goto('/categoria/nacionales/dolar-hoy', { waitUntil: 'load' })

    // Check title contains "Dolar Hoy" or similar
    const title = await page.title()
    // Metadata title comes from slug 'dolar-hoy' -> 'Dolar Hoy' (likely no accent in slug-based title)
    // But let's be loose
    expect(title.toLowerCase()).toMatch(/d[oó]lar hoy/i)

    // Verify H1
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toBeVisible()
    // Page has <PageTitle text='Dólar Hoy' />
    await expect(h1).toContainText('Dólar Hoy', { ignoreCase: true })

    // Verify Dollar Calculator is present
    // It has a title "Calculadora de Divisas"
    const calculatorTitle = page.getByText('Calculadora de Divisas')
    await expect(calculatorTitle).toBeVisible()

    // Scope to the calculator container to avoid strict mode violations with similar text on the page
    // We can find the container by looking for the parent of the title
    const calculator = page.locator('div', { has: calculatorTitle }).first()

    // Verify input fields using specific IDs or scoped labels
    const amountInput = calculator.locator('#amount-input')
    await expect(amountInput).toBeVisible()

    const currencySelect = calculator.locator('#currency-select')
    await expect(currencySelect).toBeVisible()

    // Verify rates are displayed (BCV rate)
    // We expect some numeric value followed by VES
    const rateContainer = calculator.locator('.flex.items-baseline').first()
    await expect(rateContainer).toBeVisible()
    await expect(rateContainer).toContainText('VES')
  })
})
