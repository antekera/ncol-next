import { test, expect } from './fixtures'

test.describe('Home local performance comparison', () => {
  test.skip(
    process.env.HOME_V2_AUDIT_E2E !== 'true',
    'Requires both local preview and performance-audit server flags'
  )

  test('uses the existing root page view and tag chain for both layouts', async ({
    page,
    context
  }) => {
    await page.route(
      /google-analytics\.com\/.*collect|analytics\.google\.com\/.*collect|\/api\/track(?:\?|$)/,
      route => route.fulfill({ status: 204 })
    )
    const titles: string[] = []
    for (const variant of ['control', 'v2']) {
      const response = await page.goto(`/?__ncol_home_audit=${variant}`)
      expect(response?.status()).toBe(200)
      await expect(page).toHaveURL(
        new RegExp(`/\\?__ncol_home_audit=${variant}$`)
      )
      await expect(page.locator('[data-home-variant="v2"]')).toHaveCount(
        variant === 'v2' ? 1 : 0
      )
      titles.push(await page.title())
      await expect
        .poll(() =>
          page.evaluate(() =>
            (window.dataLayer ?? []).filter(
              item => item.event === 'CUSTOM_PAGE_VIEW'
            )
          )
        )
        .toEqual([
          expect.objectContaining({ pageUrl: '/', pageTitle: titles.at(-1) })
        ])
      await expect(
        page.locator('script[src*="googletagmanager.com/gtm.js"]')
      ).toHaveCount(1)
      await expect(
        page.locator('script[src*="googletagmanager.com/gtag/destination"]')
      ).toHaveCount(1)
    }
    expect(titles[1]).toBe(titles[0])
    expect(
      (await context.cookies()).filter(cookie =>
        /home|experiment/i.test(cookie.name)
      )
    ).toEqual([])
  })
})
