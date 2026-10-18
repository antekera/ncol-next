import { test, expect } from './fixtures'
import type { Page } from '@playwright/test'

const events = (page: Page, name: string) =>
  page.evaluate(
    name => (window.dataLayer ?? []).filter(value => value.event === name),
    name
  )
let videoQueries = 0
let opinionQueries = 0

const articleClicks = (page: Page) =>
  page.evaluate(() =>
    (window.dataLayer ?? []).filter(value =>
      ['CLICK_POST_LINK', 'CLICK_VIEW_NEWS', 'CLICK_EVENT'].includes(
        value.event
      )
    )
  )

test.describe('Control opinion and confirmed video, existing dataLayer', () => {
  test.skip(
    process.env.HOME_V2_CONTROL_EDITORIAL_E2E !== 'true',
    'Local QA build only'
  )
  test.use({ actionTimeout: 10000 })
  test.beforeEach(async ({ context }) => {
    videoQueries = 0
    opinionQueries = 0
    await context.route(
      /google-analytics\.com\/.*collect|analytics\.google\.com\/.*collect|\/api\/track(?:\?|$)/,
      route => route.fulfill({ status: 204 })
    )
    await context.route(
      /\/rest\/v1\/(?:ads|ad_slot_fallbacks_public)(?:\?|$)/,
      route => route.fulfill({ status: 200, json: [] })
    )
    await context.route(/\/api\/opinion\/authors(?:\?|$)/, route => {
      opinionQueries++
      return route.fulfill({
        status: 200,
        json: [
          {
            name: 'Columnista editorial',
            slug: 'columna-qa',
            uri: '/autor/columna-qa/',
            avatarUrl: '',
            latestPost: {
              uri: '/2026/10/17/columna-qa/',
              title: 'Una columna de opinión para comprobar su origen editorial'
            }
          }
        ]
      })
    })
    await context.route('**/*', route => {
      const request = route.request()
      if (
        request.method() !== 'POST' ||
        !(request.postData() ?? '').includes('query VideoPosts')
      )
        return route.fallback()
      videoQueries++
      return route.fulfill({
        status: 200,
        json: {
          data: {
            posts: {
              edges: Array.from({ length: 6 }, (_, index) => ({
                node: {
                  id: `control-video-${index + 1}`,
                  title: `Video editorial ${index + 1}`,
                  uri: `/2026/10/17/control-video-${index + 1}/`,
                  date: new Date().toISOString(),
                  slug: `control-video-${index + 1}`,
                  categories: {
                    edges: [
                      {
                        node: { name: 'Videos', slug: 'videos', parentId: null }
                      }
                    ]
                  },
                  customFields: {
                    videodestacado:
                      'https://www.youtube.com/watch?v=M7lc1UVf-VE'
                  }
                }
              }))
            }
          }
        }
      })
    })
    await context.route(/https:\/\/www\.youtube\.com\/embed\//, route =>
      route.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><title>Native iframe fixture</title><button>Native play fixture</button>'
      })
    )
    await context.route('https://www.youtube.com/iframe_api', route =>
      route.fulfill({
        contentType: 'text/javascript',
        body: `window.__youtubePlayers = []; window.YT = { Player: class {
      constructor(frame, options) { this.frame = frame; this.options = options; this.value = -1; window.__youtubePlayers.push(this); options.events.onReady({ target: this }); }
      getPlayerState() { return this.value; }
      state(value) { this.value = value; this.options.events.onStateChange({ data: value }); }
      destroy() { this.frame.remove(); }
    }}; window.onYouTubeIframeAPIReady();`
      })
    )
  })

  for (const width of [390, 1440]) {
    test(`${width}px: opinion exposes latest article only and attributes one click`, async ({
      page
    }) => {
      await page.setViewportSize({ width, height: 1000 })
      await page.goto('/?__ncol_home_audit=control&__ncol_home_measurement=1')
      const root = page.locator('[data-home-variant="control"]')
      await root.evaluate(el =>
        el.addEventListener('click', event => event.preventDefault())
      )
      const editorialModule = root.locator(
        `section[data-module-id="opinion"][data-editorial-position="${width < 768 ? 8 : 4}"]`
      )
      await expect
        .poll(
          async () =>
            (await events(page, 'CARD_IMPRESSION')).filter(
              value => value.module_id === 'opinion'
            ).length
        )
        .toBe(0)
      await expect
        .poll(async () => {
          await editorialModule
            .locator('[data-module-marker]')
            .scrollIntoViewIfNeeded()
          return (await events(page, 'MODULE_IMPRESSION')).filter(
            value => value.module_id === 'opinion'
          ).length
        })
        .toBe(1)
      const article = editorialModule.locator('[data-article-id]')
      await article.scrollIntoViewIfNeeded()
      await expect
        .poll(
          async () =>
            (await events(page, 'CARD_IMPRESSION')).filter(
              value => value.module_id === 'opinion'
            ).length
        )
        .toBe(1)
      await editorialModule
        .getByRole('link', { name: 'Columnista editorial', exact: true })
        .last()
        .click()
      await page.waitForTimeout(100)
      expect(await articleClicks(page)).toHaveLength(0)
      await article.click()
      await expect.poll(async () => (await articleClicks(page)).length).toBe(1)
      expect((await articleClicks(page))[0]).toMatchObject({
        experiment_id: 'home_v2',
        home_variant: 'control',
        opening_treatment: 'current',
        module_id: 'opinion',
        editorial_position: width < 768 ? 8 : 4,
        item_position: 1,
        article_id: '/2026/10/17/columna-qa/',
        component_type: 'compact_card'
      })
      await editorialModule.getByRole('link', { name: 'Ver más' }).click()
      await expect.poll(async () => (await articleClicks(page)).length).toBe(2)
      expect((await articleClicks(page))[1]).toMatchObject({
        module_id: 'opinion',
        category: 'HOME_SECTION',
        label: 'VIEW_MORE'
      })
      expect(await events(page, 'CUSTOM_PAGE_VIEW')).toHaveLength(1)
      expect(opinionQueries).toBe(1)
    })

    test(`${width}px: native iframe waits for provider confirmation and preserves legacy article clicks`, async ({
      page
    }) => {
      await page.setViewportSize({ width, height: 1000 })
      let scripts = 0
      page.on('request', request => {
        if (request.url() === 'https://www.youtube.com/iframe_api') scripts++
      })
      await page.goto('/?__ncol_home_audit=control&__ncol_home_measurement=1')
      const root = page.locator('[data-home-variant="control"]')
      await root.evaluate(el =>
        el.addEventListener('click', event => event.preventDefault())
      )
      expect(scripts).toBe(0)
      const editorialModule = root.locator('section[data-module-id="videos"]')
      await root
        .locator('.mobile-centered-carousel')
        .first()
        .scrollIntoViewIfNeeded()
      await editorialModule.scrollIntoViewIfNeeded()
      const first = editorialModule.locator('[data-article-id]').first()
      await expect(first).toBeVisible()
      await expect
        .poll(async () => {
          await editorialModule
            .locator('[data-module-marker]')
            .scrollIntoViewIfNeeded()
          return (await events(page, 'MODULE_IMPRESSION')).filter(
            value => value.module_id === 'videos'
          ).length
        })
        .toBe(1)
      await expect
        .poll(async () => {
          await first.scrollIntoViewIfNeeded()
          return (await events(page, 'CARD_IMPRESSION')).filter(
            value => value.module_id === 'videos' && value.item_position === 1
          ).length
        })
        .toBe(1)
      const frame = first.locator('iframe')
      const originalSource = await frame.getAttribute('src')
      expect(originalSource).toContain('enablejsapi=1')
      expect(originalSource).not.toContain('autoplay=')
      expect(await events(page, 'PLAY_VIDEO')).toHaveLength(0)
      await first
        .frameLocator('iframe')
        .getByRole('button', { name: 'Native play fixture' })
        .click()
      await expect
        .poll(() =>
          page.evaluate(
            () =>
              !!Reflect.get(window, '__youtubePlayers')?.find(
                (player: { frame: HTMLIFrameElement }) =>
                  player.frame
                    .closest('[data-article-id]')
                    ?.getAttribute('data-article-id') === 'control-video-1'
              )
          )
        )
        .toBe(true)
      expect(await events(page, 'PLAY_VIDEO')).toHaveLength(0)
      await page.evaluate(() => {
        const player = Reflect.get(window, '__youtubePlayers').find(
          (player: { frame: HTMLIFrameElement }) =>
            player.frame
              .closest('[data-article-id]')
              ?.getAttribute('data-article-id') === 'control-video-1'
        )
        player.state(3)
        player.state(2)
      })
      expect(await events(page, 'PLAY_VIDEO')).toHaveLength(0)
      await page.evaluate(() => {
        const player = Reflect.get(window, '__youtubePlayers').find(
          (player: { frame: HTMLIFrameElement }) =>
            player.frame
              .closest('[data-article-id]')
              ?.getAttribute('data-article-id') === 'control-video-1'
        )
        player.state(1)
        player.state(1)
      })
      await expect
        .poll(async () => (await events(page, 'PLAY_VIDEO')).length)
        .toBe(1)
      expect((await events(page, 'PLAY_VIDEO'))[0]).toMatchObject({
        home_variant: 'control',
        opening_treatment: 'current',
        module_id: 'videos',
        editorial_position: 5,
        item_position: 1,
        article_id: 'control-video-1',
        video_provider: 'youtube',
        video_id: 'M7lc1UVf-VE'
      })
      await expect(frame).toHaveAttribute('src', originalSource!)
      expect(scripts).toBe(1)
      await first.locator('h4 a').click()
      await expect.poll(async () => (await articleClicks(page)).length).toBe(1)
      expect((await articleClicks(page))[0]).toMatchObject({
        event: 'CLICK_POST_LINK',
        module_id: 'videos',
        article_id: 'control-video-1',
        home_variant: 'control'
      })
      await first.getByRole('link', { name: 'Ver noticia' }).click()
      await expect.poll(async () => (await articleClicks(page)).length).toBe(2)
      expect((await articleClicks(page))[1]).toMatchObject({
        event: 'CLICK_VIEW_NEWS',
        module_id: 'videos',
        article_id: 'control-video-1'
      })
      const navigation = async () =>
        (await events(page, 'CLICK_EVENT')).filter(
          value => value.label === 'CAROUSEL_NAVIGATION'
        )
      await editorialModule
        .getByRole('button', { name: 'Scroll right' })
        .click()
      await expect.poll(async () => (await navigation()).length).toBe(1)
      expect((await navigation())[0]).toMatchObject({
        home_variant: 'control',
        module_id: 'videos',
        editorial_position: 5,
        from_item_position: 1,
        navigation_method: 'arrow',
        direction: 'next'
      })
      const strip = editorialModule.getByRole('region', {
        name: 'Carrusel de videos actuales'
      })
      await strip.evaluate(el => el.scrollTo({ left: 0, behavior: 'instant' }))
      await page.waitForTimeout(400)
      expect(await navigation()).toHaveLength(1)
      await first.getByRole('link', { name: 'Ver noticia' }).hover()
      await page.mouse.wheel(420, 0)
      await expect.poll(async () => (await navigation()).length).toBe(2)
      expect((await navigation())[1]).toMatchObject({
        home_variant: 'control',
        navigation_method: 'gesture',
        direction: 'next'
      })
      expect(await events(page, 'PLAY_VIDEO')).toHaveLength(1)
      expect(videoQueries).toBe(1)
    })
  }
})
