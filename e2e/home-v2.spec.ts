import { test, expect } from './fixtures'

// This opt-in suite targets the local, noindex production preview. It never
// enables an experiment or silently treats a 404 as successful validation.
test.describe('Home V2 local preview', () => {
  test.skip(process.env.HOME_V2_E2E !== 'true', 'Requires local opt-in preview')
  test.beforeEach(async ({ page }) => {
    // Public-route regression checks must not store QA events in production.
    await page.route(
      /google-analytics\.com\/.*collect|analytics\.google\.com\/.*collect|\/api\/track(?:\?|$)/,
      route => route.fulfill({ status: 204 })
    )
  })

  for (const width of [1440, 390]) {
    test(`editorial layout and image fallback at ${width}px`, async ({
      page
    }, info) => {
      await page.setViewportSize({ width, height: 900 })
      const response = await page.goto('/home-v2-preview/')
      expect(response?.status()).toBe(200)
      const home = page.locator('[data-home-variant="v2"]')
      await expect(home.getByRole('heading', { level: 1 })).toHaveCount(1)
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        'content',
        'noindex, nofollow'
      )
      await expect(
        home.locator('section[data-module-id="nacionales"]')
      ).toBeVisible()
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        )
      ).toBe(true)
      const opening = home.locator('section[data-module-id="opening"]')
      const image = opening.locator('img[data-home-critical="true"]')
      await expect(image).toHaveAttribute('loading', 'eager')
      await expect(image).toHaveAttribute('fetchpriority', 'high')
      const before = await opening.boundingBox()
      await image.dispatchEvent('error')
      await expect(opening).toHaveAttribute(
        'data-opening-treatment',
        'traditional'
      )
      await expect(image).toHaveAttribute('src', '/media/logo-plain.png')
      const after = await opening.boundingBox()
      expect(after?.height).toBeCloseTo(before?.height ?? 0, 0)
      expect(after?.width).toBeCloseTo(before?.width ?? 0, 0)
      await info.attach(`home-v2-${width}`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png'
      })
    })
  }

  test('regional navigation reuses results without route changes', async ({
    page
  }) => {
    await page.goto('/home-v2-preview/')
    const region = page.locator('section[data-module-id="zulia"]')
    const select = page.getByRole('combobox', { name: 'Municipio o región' })
    await expect(select).toBeEnabled()
    let actions = 0
    page.on('request', request => {
      if (request.headers()['next-action']) actions++
    })
    await select.selectOption('maracaibo')
    await expect(region).toHaveAttribute('data-region-id', 'maracaibo')
    await expect(region).toHaveAttribute('aria-busy', 'false')
    expect(actions).toBe(1)
    await select.selectOption('zulia')
    await expect(region).toHaveAttribute('data-region-id', 'zulia')
    await select.selectOption('maracaibo')
    await expect(region).toHaveAttribute('data-region-id', 'maracaibo')
    expect(actions).toBe(1)
    await expect(page).toHaveURL(/\/home-v2-preview\/$/)
  })

  test('video embeds load only after keyboard activation', async ({ page }) => {
    await page.route(
      /https:\/\/www\.(youtube|dailymotion)\.com\/embed\//,
      route =>
        route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: '<p>Video fixture</p>'
        })
    )
    await page.goto('/home-v2-preview/')
    const videos = page.locator('section[data-module-id="videos"]')
    await videos.scrollIntoViewIfNeeded()
    await expect(videos.locator('iframe')).toHaveCount(0)
    const play = videos.getByRole('button', { name: /^Reproducir:/ }).first()
    await play.focus()
    await page.keyboard.press('Enter')
    await expect(videos.locator('iframe')).toHaveCount(1)
    await expect(videos.locator('iframe')).toHaveAttribute('src', /autoplay=1/)
    await page.getByRole('button', { name: 'Videos siguientes' }).click()
  })

  test('preview sends no analytics or ad counters; control remains available', async ({
    page
  }) => {
    const tracking: string[] = []
    page.on('request', request => {
      if (
        /googletagmanager\.com|google-analytics\.com|\/api\/track(?:\?|$)/.test(
          request.url()
        )
      )
        tracking.push(request.url())
    })
    await page.goto('/home-v2-preview/')
    const sidebar = page.locator('[data-module-id="services"]')
    await sidebar.scrollIntoViewIfNeeded()
    await expect(sidebar).toBeVisible()
    expect(tracking).toEqual([])
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)
    await expect(page.locator('[data-home-variant="v2"]')).toHaveCount(0)
    await expect(page.getByRole('main')).toBeVisible()
  })

  test('control, category and destination article preserve real navigation', async ({
    page
  }) => {
    const control = await page.goto('/')
    expect(control?.status()).toBe(200)
    await expect(page.locator('[data-home-variant="v2"]')).toHaveCount(0)
    const links = await page
      .locator('main a[href]')
      .evaluateAll(elements =>
        elements.map(element => element.getAttribute('href') ?? '')
      )
    const destination = links
      .map(href => new URL(href, 'https://www.noticiascol.com').pathname)
      .find(path => /^\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/?$/.test(path))
    expect(destination, 'Control must contain a real article link').toBeTruthy()
    const category = await page.goto('/categoria/nacionales/')
    expect(category?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      /Nacionales/i
    )
    await expect(page.locator('main article').first()).toBeVisible()
    const article = await page.goto(destination!)
    expect(article?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
    await expect(page.locator('main time').first()).toBeVisible()
    expect(await page.locator('main p').count()).toBeGreaterThan(0)
  })
})
