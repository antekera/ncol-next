import { test, expect } from './fixtures'

const events = (page: import('@playwright/test').Page, name: string) =>
  page.evaluate(
    name => (window.dataLayer ?? []).filter(value => value.event === name),
    name
  )
test.describe('Home V2 video measurement', () => {
  test.skip(
    process.env.HOME_V2_VIDEO_E2E !== 'true',
    'Requires local opt-in measurement build'
  )
  test.beforeEach(async ({ page }) => {
    await page.route(
      /google-analytics\.com\/.*collect|analytics\.google\.com\/.*collect|\/api\/track(?:\?|$)/,
      route => route.fulfill({ status: 204 })
    )
    await page.route(
      /\/rest\/v1\/(?:ads|ad_slot_fallbacks_public)(?:\?|$)/,
      route => route.fulfill({ status: 200, json: [] })
    )
    await page.route(/https:\/\/www\.youtube\.com\/embed\//, route =>
      route.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><title>Player transport fixture</title><button>Playback fixture</button>'
      })
    )
    await page.route('https://www.youtube.com/iframe_api', route =>
      route.fulfill({
        contentType: 'text/javascript',
        body: `
      window.__youtubePlayers = [];
      window.YT = { Player: class {
        constructor(frame, options) {
          this.frame = frame; this.options = options; this.value = -1; this.destroyed = false;
          window.__youtubePlayers.push(this);
          options.events.onReady({ target: this });
        }
        getPlayerState() { return this.value; }
        state(value) { this.value = value; this.options.events.onStateChange({ data: value, target: this }); }
        destroy() { this.destroyed = true; this.frame.remove(); }
      }};
      window.onYouTubeIframeAPIReady();
    `
      })
    )
  })

  for (const width of [390, 1440]) {
    test(`${width}px: shared legacy cards keep lazy embeds, SDK confirmation and attributed clicks without refetching videos`, async ({
      page
    }) => {
      await page.setViewportSize({ width, height: 900 })
      let scripts = 0
      let videoQueries = 0
      page.on('request', request => {
        if (request.url() === 'https://www.youtube.com/iframe_api') scripts++
        if (
          request.method() === 'POST' &&
          request.postData()?.includes('VideoPosts')
        )
          videoQueries++
      })
      await page.goto('/?__ncol_home_audit=v2&__ncol_home_measurement=1')
      const root = page.locator('[data-home-variant="v2"]')
      await root.evaluate(el =>
        el.addEventListener('click', event => event.preventDefault())
      )
      expect(
        await root.locator('.mobile-centered-carousel iframe').count()
      ).toBe(0)
      expect(scripts).toBe(0)
      await root
        .locator('.mobile-centered-carousel')
        .first()
        .scrollIntoViewIfNeeded()
      const module = root.locator('section[data-module-id="videos"]')
      await expect(module).toBeVisible()
      await expect(module).toHaveAttribute('data-editorial-position', '6')
      const cards = module
        .locator('[data-component-type="video_card"]')
        .filter({ has: page.locator('iframe[src*="youtube.com"]') })
      expect(await cards.count()).toBeGreaterThan(1)
      const first = cards.first()
      await first.scrollIntoViewIfNeeded()
      const firstId = await first.getAttribute('data-article-id')
      const playerReady = (id: string | null) =>
        page.evaluate(
          id =>
            !!Reflect.get(window, '__youtubePlayers')?.find(
              (player: { frame: HTMLIFrameElement }) =>
                player.frame
                  .closest('[data-article-id]')
                  ?.getAttribute('data-article-id') === id
            ),
          id
        )
      const states = (id: string | null, values: number[]) =>
        page.evaluate(
          ({ id, values }) => {
            const player = Reflect.get(window, '__youtubePlayers').find(
              (player: { frame: HTMLIFrameElement }) =>
                player.frame
                  .closest('[data-article-id]')
                  ?.getAttribute('data-article-id') === id
            )
            for (const value of values) player.state(value)
          },
          { id, values }
        )
      await expect.poll(() => playerReady(firstId)).toBe(true)
      await expect(first.locator('iframe')).toHaveAttribute(
        'src',
        /enablejsapi=1/
      )
      await expect(first.locator('iframe')).not.toHaveAttribute(
        'src',
        /autoplay=/
      )
      await first
        .frameLocator('iframe')
        .getByRole('button', { name: 'Playback fixture' })
        .click()
      await states(firstId, [3, 2])
      expect(await events(page, 'PLAY_VIDEO')).toHaveLength(0)
      await states(firstId, [1, 1])
      await expect
        .poll(async () => (await events(page, 'PLAY_VIDEO')).length)
        .toBe(1)
      expect((await events(page, 'PLAY_VIDEO'))[0]).toMatchObject({
        experiment_id: 'home_v2',
        home_variant: 'v2',
        opening_treatment:
          process.env.HOME_V2_PREVIEW_TREATMENT === 'traditional'
            ? 'traditional'
            : 'photographic',
        module_id: 'videos',
        editorial_position: 6,
        article_id: firstId,
        video_provider: 'youtube'
      })
      const second = cards.nth(1)
      await second.scrollIntoViewIfNeeded()
      const secondId = await second.getAttribute('data-article-id')
      await expect.poll(() => playerReady(secondId)).toBe(true)
      await states(secondId, [1, 1])
      await expect
        .poll(async () => (await events(page, 'PLAY_VIDEO')).length)
        .toBe(2)
      await first.scrollIntoViewIfNeeded()
      await first.getByRole('link', { name: 'Ver noticia' }).click()
      await expect
        .poll(async () => (await events(page, 'CLICK_VIEW_NEWS')).length)
        .toBe(1)
      expect((await events(page, 'CLICK_VIEW_NEWS'))[0]).toMatchObject({
        module_id: 'videos',
        editorial_position: 6,
        article_id: firstId,
        home_variant: 'v2'
      })
      expect(scripts).toBe(1)
      expect(videoQueries).toBe(0)
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth
        )
      ).toBe(true)
    })

    test(`${width}px: completed arrow/wheel navigation, no event at an edge or on programmatic scroll`, async ({
      page
    }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/?__ncol_home_audit=v2&__ncol_home_measurement=1')
      await page
        .locator('[data-home-variant="v2"] .mobile-centered-carousel')
        .first()
        .scrollIntoViewIfNeeded()
      const module = page.locator('section[data-module-id="videos"]')
      const strip = module.getByRole('region', {
        name: 'Carrusel de videos actuales'
      })
      await module.scrollIntoViewIfNeeded()
      const navigation = async () =>
        (await events(page, 'CLICK_EVENT')).filter(
          value => value.label === 'CAROUSEL_NAVIGATION'
        )
      await module.getByRole('button', { name: 'Scroll right' }).click()
      await expect.poll(async () => (await navigation()).length).toBe(1)
      expect((await navigation())[0]).toMatchObject({
        experiment_id: 'home_v2',
        home_variant: 'v2',
        module_id: 'videos',
        from_item_position: 1,
        direction: 'next',
        navigation_method: 'arrow'
      })
      await strip.evaluate(el =>
        el.scrollTo({ left: el.scrollWidth, behavior: 'instant' })
      )
      await page.waitForTimeout(400)
      expect(await navigation()).toHaveLength(1)
      await expect(
        module.getByRole('button', { name: 'Scroll right' })
      ).toBeDisabled()
      expect(await navigation()).toHaveLength(1)
      await strip.evaluate(el => el.scrollTo({ left: 0, behavior: 'instant' }))
      await page.waitForTimeout(400)
      await strip.getByRole('link', { name: 'Ver noticia' }).first().hover()
      await page.mouse.wheel(420, 0)
      await expect.poll(async () => (await navigation()).length).toBe(2)
      expect((await navigation())[1]).toMatchObject({
        navigation_method: 'gesture',
        direction: 'next',
        from_item_position: 1
      })
      expect(await events(page, 'PLAY_VIDEO')).toHaveLength(0)
    })
  }

  for (const fallback of [false, true])
    test(`native touch pan ${fallback ? 'without' : 'with'} scrollend waits for release after pointer cancellation`, async ({
      browser,
      browserName,
      baseURL
    }) => {
      test.skip(
        browserName !== 'chromium',
        'Native touch dispatch requires CDP'
      )
      const context = await browser.newContext({
        baseURL,
        viewport: { width: 390, height: 900 },
        hasTouch: true,
        isMobile: true
      })
      try {
        if (fallback)
          await context.addInitScript(() => {
            Object.defineProperty(HTMLElement.prototype, 'onscrollend', {
              value: undefined,
              configurable: true
            })
          })
        await context.route(
          /google-analytics\.com\/.*collect|analytics\.google\.com\/.*collect|\/api\/track(?:\?|$)/,
          route => route.fulfill({ status: 204 })
        )
        await context.route(
          /\/rest\/v1\/(?:ads|ad_slot_fallbacks_public)(?:\?|$)/,
          route => route.fulfill({ status: 200, json: [] })
        )
        const page = await context.newPage()
        await page.goto('/?__ncol_home_audit=v2&__ncol_home_measurement=1')
        await page
          .locator('[data-home-variant="v2"] .mobile-centered-carousel')
          .first()
          .scrollIntoViewIfNeeded()
        const strip = page.getByRole('region', {
          name: 'Carrusel de videos actuales'
        })
        await strip.scrollIntoViewIfNeeded()
        await strip.evaluate(el =>
          el.scrollTo({ left: 0, behavior: 'instant' })
        )
        await page.waitForTimeout(400)
        const bounds = await strip.boundingBox()
        expect(bounds).not.toBeNull()
        await strip.evaluate(el => {
          const trace: string[] = []
          Reflect.set(window, '__touchTrace', trace)
          for (const name of ['pointerdown', 'pointercancel', 'scroll'])
            el.addEventListener(name, () => trace.push(name), { passive: true })
        })
        const cdp = await context.newCDPSession(page)
        const x = bounds!.x + bounds!.width * 0.85
        // Native players own pointer events inside their cross-origin iframe.
        // Pan the card caption, as in the existing Home carousel regression.
        const caption = await strip.locator('h4').first().boundingBox()
        expect(caption).not.toBeNull()
        const y = caption!.y + caption!.height / 2
        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchStart',
          touchPoints: [{ x, y, id: 1 }]
        })
        for (let step = 1; step <= 10; step++) {
          await cdp.send('Input.dispatchTouchEvent', {
            type: 'touchMove',
            touchPoints: [{ x: x - step * 26, y, id: 1 }]
          })
          await page.waitForTimeout(20)
        }
        await page.waitForTimeout(350)
        expect(
          (await events(page, 'CLICK_EVENT')).filter(
            value => value.label === 'CAROUSEL_NAVIGATION'
          )
        ).toHaveLength(0)
        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchEnd',
          touchPoints: []
        })
        const navigation = async () =>
          (await events(page, 'CLICK_EVENT')).filter(
            value => value.label === 'CAROUSEL_NAVIGATION'
          )
        await expect.poll(async () => (await navigation()).length).toBe(1)
        expect((await navigation())[0]).toMatchObject({
          module_id: 'videos',
          navigation_method: 'gesture',
          direction: 'next',
          from_item_position: 1
        })
        expect((await navigation())[0].to_item_position).toBeGreaterThan(1)
        const trace: string[] = await page.evaluate(() =>
          Reflect.get(window, '__touchTrace')
        )
        expect(trace.indexOf('pointercancel')).toBeGreaterThanOrEqual(0)
        expect(trace.indexOf('scroll')).toBeGreaterThan(
          trace.indexOf('pointercancel')
        )
        expect(await events(page, 'PLAY_VIDEO')).toHaveLength(0)
        await cdp.detach()
      } finally {
        await context.close()
      }
    })

  test('unmeasured preview plays the native iframe without loading an analytical SDK', async ({
    page
  }) => {
    let scripts = 0
    page.on('request', request => {
      if (request.url() === 'https://www.youtube.com/iframe_api') scripts++
    })
    await page.goto('/home-v2-preview/')
    await page
      .locator('[data-home-variant="v2"] .mobile-centered-carousel')
      .first()
      .scrollIntoViewIfNeeded()
    const card = page
      .locator(
        'section[data-module-id="videos"] [data-component-type="video_card"]'
      )
      .filter({ has: page.locator('iframe[src*="youtube.com"]') })
      .first()
    await card.scrollIntoViewIfNeeded()
    await expect(card.locator('iframe')).toBeVisible()
    await expect(card.locator('iframe')).not.toHaveAttribute('src', /autoplay=/)
    await card
      .frameLocator('iframe')
      .getByRole('button', { name: 'Playback fixture' })
      .click()
    expect(scripts).toBe(0)
    expect(await events(page, 'PLAY_VIDEO')).toHaveLength(0)
  })
})
