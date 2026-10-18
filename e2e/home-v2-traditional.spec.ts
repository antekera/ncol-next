import { test, expect } from './fixtures'

test.describe('Home V2 traditional opening', () => {
  test.skip(
    process.env.HOME_V2_TRADITIONAL_E2E !== 'true',
    'Requires the local server with HOME_V2_PREVIEW_TREATMENT=traditional'
  )
  test('short-headline fixture agrees in server HTML and hydrated content without changing cached news', async ({
    page
  }) => {
    await page.route(
      /google-analytics\.com\/.*collect|analytics\.google\.com\/.*collect|\/api\/track(?:\?|$)/,
      route => route.fulfill({ status: 204 })
    )
    await page.route(
      /\/rest\/v1\/(?:ads|ad_slot_fallbacks_public)(?:\?|$)/,
      route => route.fulfill({ status: 200, json: [] })
    )
    const url = '/?__ncol_home_audit=v2'
    await page.goto(url)
    const root = page.locator('[data-home-variant="v2"]')
    const original = await root.locator('h1').textContent()
    const article = await root
      .locator('[data-article-id]')
      .first()
      .getAttribute('data-article-id')
    const response = await page.goto(`${url}&__ncol_home_audit_headline=short`)
    expect(await response!.text()).toMatch(
      /<h1[^>]*>Noticias de última hora en Zulia<\/h1>/
    )
    await expect(root.locator('h1')).toHaveText(
      'Noticias de última hora en Zulia'
    )
    await expect(root.locator('[data-article-id]').first()).toHaveAttribute(
      'data-article-id',
      article!
    )
    await page.reload()
    await expect(root.locator('h1')).toHaveText(
      'Noticias de última hora en Zulia'
    )
    await page.goto(url)
    await expect(root.locator('h1')).toHaveText(original!)
  })

  for (const width of [390, 900, 1440]) {
    test(`uses the automatic no-image treatment at ${width}px`, async ({
      page
    }, info) => {
      await page.setViewportSize({ width, height: 900 })
      const attempts: string[] = []
      page.on('request', request => {
        if (
          /googletagmanager\.com|google-analytics\.com|\/api\/track(?:\?|$)/.test(
            request.url()
          )
        )
          attempts.push(new URL(request.url()).hostname)
      })
      await page.route(
        /google-analytics\.com\/.*collect|analytics\.google\.com\/.*collect|\/api\/track(?:\?|$)/,
        route => route.fulfill({ status: 204 })
      )
      const response = await page.goto('/home-v2-preview/')
      expect(response?.status()).toBe(200)
      const home = page.locator('[data-home-variant="v2"]')
      const opening = home.locator('section[data-module-id="opening"]')
      await expect(opening).toHaveAttribute(
        'data-opening-treatment',
        'traditional'
      )
      await expect(opening).toHaveAttribute(
        'data-initial-treatment',
        'traditional'
      )
      await expect(home.getByRole('heading', { level: 1 })).toHaveCount(1)
      await expect(home.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(opening.locator('img[data-home-critical]')).toHaveCount(0)
      await expect(
        opening.locator('article[data-component-type="hero"] picture')
      ).toHaveCount(0)
      if (width >= 1024)
        expect((await opening.boundingBox())!.height).toBeLessThan(360)
      const secondary = opening
        .locator('article[data-component-type="compact_card"] picture')
        .first()
      await expect(secondary.locator('source')).toHaveAttribute('sizes', '92px')
      expect((await secondary.boundingBox())!.width).toBeCloseTo(92, 0)
      await expect(page.locator('link[rel="preload"][as="image"]')).toHaveCount(
        0
      )
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        )
      ).toBe(true)
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        'content',
        'noindex, nofollow'
      )
      await expect(
        home.locator('section[data-module-id="nacionales"]')
      ).toBeVisible()
      expect(attempts).toEqual([])
      await info.attach(`home-traditional-${width}`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png'
      })
    })
  }
})
