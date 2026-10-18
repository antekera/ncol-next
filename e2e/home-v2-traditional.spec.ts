import { test, expect } from './fixtures'

test.describe('Home V2 traditional opening', () => {
  test.skip(
    process.env.HOME_V2_TRADITIONAL_E2E !== 'true',
    'Requires the local server with HOME_V2_PREVIEW_TREATMENT=traditional'
  )
  for (const width of [390, 1440]) {
    test(`regional lead is discoverable without hydration at ${width}px`, async ({
      browser
    }, info) => {
      const context = await browser.newContext({
        javaScriptEnabled: false,
        viewport: { width, height: 900 }
      })
      try {
        const page = await context.newPage()
        await page.goto('/home-v2-preview/')
        const lead = page.locator(
          'section[data-module-id="zulia"] article[data-item-position="1"] picture img'
        )
        await expect(lead).toHaveCount(1)
        await expect(lead).toHaveAttribute('loading', 'lazy')
        await expect(lead).not.toHaveAttribute('fetchpriority', 'high')
        await expect(
          page.locator('link[rel="preload"][as="image"]')
        ).toHaveCount(0)
        if (width === 1440) {
          await expect(lead).toBeInViewport()
          await expect
            .poll(() =>
              lead.evaluate((img: HTMLImageElement) =>
                img.currentSrc ? new URL(img.currentSrc).pathname : ''
              )
            )
            .toMatch(/^\/_next\/image\/?$/)
          await expect
            .poll(() =>
              lead.evaluate(
                (img: HTMLImageElement) => img.complete && img.naturalWidth > 0
              )
            )
            .toBe(true)
        }
        await info.attach('traditional-without-javascript', {
          body: await page.screenshot(),
          contentType: 'image/png'
        })
      } finally {
        await context.close()
      }
    })
  }
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
