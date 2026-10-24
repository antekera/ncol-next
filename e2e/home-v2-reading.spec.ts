import { test, expect } from './fixtures'
import type { Page } from '@playwright/test'

const events = (page: Page, event: string) =>
  page.evaluate(
    name =>
      (window.dataLayer ?? []).filter(
        value => value && 'event' in value && value.event === name
      ),
    event
  )

test.describe('Home reading attribution, explicit local permission fixture', () => {
  test.skip(
    process.env.HOME_V2_READING_E2E !== 'true',
    'Requires an explicit local reading QA build'
  )
  test.use({ actionTimeout: 10000 })
  test.beforeEach(async ({ context }) => {
    await context.route(
      /google-analytics\.com\/.*collect|analytics\.google\.com\/.*collect|\/api\/track(?:\?|$)/,
      route => route.fulfill({ status: 204 })
    )
    await context.route(
      /\/rest\/v1\/(?:ads|ad_slot_fallbacks_public)(?:\?|$)/,
      route => route.fulfill({ status: 200, json: [] })
    )
    await context.addInitScript(() => {
      localStorage.setItem('socialBannerDismissed', 'true')
      sessionStorage.setItem('socialBannerDismissed', 'true')
    })
  })
  for (const width of [390, 1440]) {
    test(`${width}px: real Home click, destination and one second article across tabs`, async ({
      page,
      context
    }) => {
      await page.setViewportSize({ width, height: 1000 })
      await page.goto('/?__ncol_home_audit=v2&__ncol_home_measurement=1')
      await expect(page.locator('body')).toHaveAttribute(
        'data-home-reading-qa',
        'granted'
      )
      const opening = page.locator('section[data-module-id="opening"]')
      const first = opening.locator('[data-article-id]').first()
      const originId = await first.getAttribute('data-article-id')
      const secondUri = await opening
        .locator('[data-article-id]')
        .nth(1)
        .getAttribute('data-article-uri')
      expect(secondUri).toMatch(/^\//)
      await expect
        .poll(async () => (await events(page, 'MODULE_IMPRESSION')).length)
        .toBeGreaterThan(0)
      await first.locator('a').first().click()
      await page.bringToFront()
      const root = page.locator('[data-reading-article-id]').first()
      await expect(root.locator('h1').first()).toBeVisible()
      await expect
        .poll(
          async () => (await events(page, 'ARTICLE_DESTINATION_OPEN')).length
        )
        .toBe(1)
      expect((await events(page, 'ARTICLE_DESTINATION_OPEN'))[0]).toMatchObject(
        {
          home_version: 'v2',
          module_id: 'opening',
          origin_article_id: originId,
          article_id: await root.getAttribute('data-reading-article-id')
        }
      )
      expect(await events(page, 'SECOND_ARTICLE_OPEN')).toHaveLength(0)
      const tab = await context.newPage()
      await tab.setViewportSize({ width, height: 1000 })
      await tab.goto(secondUri!)
      await tab.bringToFront()
      await expect
        .poll(async () => (await events(tab, 'SECOND_ARTICLE_OPEN')).length)
        .toBe(1)
      expect((await events(tab, 'SECOND_ARTICLE_OPEN'))[0]).toMatchObject({
        home_version: 'v2',
        module_id: 'opening',
        origin_article_id: originId
      })
      await tab.reload()
      await tab.bringToFront()
      await expect(
        tab.locator('[data-reading-article-id]').first()
      ).toBeAttached()
      await tab.waitForTimeout(1800)
      expect(await events(tab, 'ARTICLE_DESTINATION_OPEN')).toHaveLength(0)
      expect(await events(tab, 'SECOND_ARTICLE_OPEN')).toHaveLength(0)
      await tab.close()
    })
  }
  test('first news opens in a fresh tab from a Home gesture', async ({
    page,
    context,
    browserName
  }) => {
    await page.setViewportSize({ width: 390, height: 1000 })
    await page.goto('/?__ncol_home_audit=v2&__ncol_home_measurement=1')
    await expect
      .poll(async () => (await events(page, 'MODULE_IMPRESSION')).length)
      .toBeGreaterThan(0)
    const card = page
      .locator('section[data-module-id="opening"] [data-article-id]')
      .first()
    const originId = await card.getAttribute('data-article-id')
    const link = card.locator('a').first()
    // The WebKit test driver does not open a page on middle-button input.
    // A target fixture exercises its real anchor navigation and click handler.
    if (browserName === 'webkit')
      await link.evaluate(node => {
        node.target = '_blank'
      })
    const nextTab = context.waitForEvent('page')
    await link.click({ button: browserName === 'webkit' ? 'left' : 'middle' })
    const tab = await nextTab
    await tab.bringToFront()
    await expect
      .poll(async () => (await events(tab, 'ARTICLE_DESTINATION_OPEN')).length)
      .toBe(1)
    expect((await events(tab, 'ARTICLE_DESTINATION_OPEN'))[0]).toMatchObject({
      origin_article_id: originId,
      module_id: 'opening',
      home_version: 'v2'
    })
    expect(await events(tab, 'SECOND_ARTICLE_OPEN')).toHaveLength(0)
    expect(await events(page, 'CLICK_EVENT')).toHaveLength(1)
    await tab.close()
  })

  test('390px: 30 seconds of focused body reading, then permission revocation', async ({
    page,
    browserName
  }) => {
    test.skip(
      browserName !== 'chromium',
      'Timed engagement sample; cross-browser openings covered separately'
    )
    await page.setViewportSize({ width: 390, height: 900 })
    await page.goto('/?__ncol_home_audit=control&__ncol_home_measurement=1')
    await expect
      .poll(async () => (await events(page, 'MODULE_IMPRESSION')).length)
      .toBeGreaterThan(0)
    await page.locator('section[data-module-id="opening"] h1 a').click()
    await page.bringToFront()
    await expect
      .poll(async () => (await events(page, 'ARTICLE_DESTINATION_OPEN')).length)
      .toBe(1)
    const paragraph = page
      .locator('[data-reading-body] p')
      .filter({ hasText: /\S.{40}/ })
      .first()
    await paragraph.scrollIntoViewIfNeeded()
    await page.waitForTimeout(32000)
    await expect
      .poll(async () => (await events(page, 'ARTICLE_ENGAGEMENT')).length)
      .toBe(1)
    expect((await events(page, 'ARTICLE_ENGAGEMENT'))[0]).toMatchObject({
      home_version: 'current',
      opening_treatment: 'current',
      active_reading_seconds: 30
    })
    await page.evaluate(() => {
      document.body.dataset.homeReadingQa = 'denied'
    })
    await expect
      .poll(() =>
        page.evaluate(() =>
          Object.keys(localStorage).filter(key =>
            key.startsWith('ncol:home-v2-')
          )
        )
      )
      .toEqual([])
    await page.waitForTimeout(1200)
    expect(await events(page, 'ARTICLE_ENGAGEMENT')).toHaveLength(1)
  })
})
