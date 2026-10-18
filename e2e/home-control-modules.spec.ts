import { test, expect } from './fixtures'
import type { Page } from '@playwright/test'

const events = (page: Page, name: string) =>
  page.evaluate(
    event =>
      (window.dataLayer ?? []).filter(
        value => value && 'event' in value && value.event === event
      ),
    name
  )

test.describe('Control ranking and services with the existing dataLayer', () => {
  test.skip(
    process.env.HOME_V2_MEASUREMENT_E2E !== 'true',
    'Manual local measurement QA only'
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
    await context.route(/\/api\/most-visited(?:\?|$)/, route => {
      const days = new URL(route.request().url()).searchParams.get('days')
      return route.fulfill({
        status: 200,
        json: {
          posts: [1, 2].map(index => ({
            slug: `/2026/10/17/qa-ranking-${days}-${index}/`,
            title: `Noticia editorial de ranking ${days}, posición ${index}`,
            image: '/media/nc.png'
          }))
        }
      })
    })
  })
  for (const width of [390, 1440]) {
    test(`${width}px: visible ranking, one legacy click and service origin`, async ({
      page
    }) => {
      await page.setViewportSize({ width, height: 1000 })
      await page.goto('/?__ncol_home_audit=control&__ncol_home_measurement=1')
      await expect
        .poll(async () => (await events(page, 'CUSTOM_PAGE_VIEW')).length)
        .toBe(1)
      const root = page.locator('[data-home-variant="control"]')
      await root.evaluate(element =>
        element.addEventListener('click', event => event.preventDefault())
      )
      const moduleId = width < 768 ? 'ranking-week' : 'ranking'
      const ranking = root.locator(`section[data-module-id="${moduleId}"]`)
      await ranking.scrollIntoViewIfNeeded()
      const first = ranking.locator('[data-article-id]').first()
      // Earlier lazy images can move this below-fold placeholder after the
      // initial scroll. Keep the real lazy module in view until it loads.
      await expect
        .poll(async () => {
          await ranking.scrollIntoViewIfNeeded()
          return first.isVisible()
        })
        .toBe(true)
      await ranking
        .locator('[data-module-marker]')
        .first()
        .scrollIntoViewIfNeeded()
      await expect
        .poll(async () => {
          await ranking
            .locator('[data-module-marker]')
            .first()
            .scrollIntoViewIfNeeded()
          return (await events(page, 'MODULE_IMPRESSION')).filter(
            value => value.module_id === moduleId
          ).length
        })
        .toBe(1)
      await first.scrollIntoViewIfNeeded()
      await expect
        .poll(
          async () =>
            (await events(page, 'CARD_IMPRESSION')).filter(
              value => value.module_id === moduleId && value.item_position === 1
            ).length
        )
        .toBe(1)
      await first.locator('h2 a').click()
      const more = ranking.locator('[data-component-type="section_link"]')
      if (width >= 768) {
        await more.click()
        const today = root.locator('section[data-module-id="ranking-today"]')
        await today
          .locator('[data-module-marker]')
          .first()
          .scrollIntoViewIfNeeded()
        await expect
          .poll(
            async () =>
              (await events(page, 'MODULE_IMPRESSION')).filter(
                value => value.module_id === 'ranking-today'
              ).length
          )
          .toBe(1)
        const todayCard = today.locator('[data-article-id]').first()
        await todayCard.scrollIntoViewIfNeeded()
        await expect
          .poll(
            async () =>
              (await events(page, 'CARD_IMPRESSION')).filter(
                value =>
                  value.module_id === 'ranking-today' &&
                  value.item_position === 1
              ).length
          )
          .toBe(1)
        await todayCard.locator('h2 a').click()
      }
      const services = root.locator('section[data-module-id="services"]')
      await expect
        .poll(async () => {
          await services
            .locator('[data-module-marker]')
            .evaluate(element =>
              element.scrollIntoView({ block: 'center', behavior: 'instant' })
            )
          return (await events(page, 'MODULE_IMPRESSION')).filter(
            value => value.module_id === 'services'
          ).length
        })
        .toBe(1)
      await services.locator('[data-service-id="calculator"]').click()
      await expect
        .poll(async () => (await events(page, 'CLICK_EVENT')).length)
        .toBe(width < 768 ? 2 : 4)
      const clicks = await events(page, 'CLICK_EVENT')
      expect(clicks).toHaveLength(width < 768 ? 2 : 4)
      expect(
        clicks.filter(value => value.module_id === moduleId && value.article_id)
      ).toHaveLength(1)
      expect(clicks.find(value => value.article_id)).toMatchObject({
        home_variant: 'control',
        item_position: 1,
        category: 'LINK_SINGLE',
        label: width < 768 ? 'RECENT_NEWS' : 'MOST_VISITED'
      })
      if (width >= 768) {
        expect(
          clicks.filter(
            value => value.module_id === 'ranking-today' && value.article_id
          )
        ).toHaveLength(1)
        expect(
          clicks.find(value => value.category === 'HOME_SECTION')
        ).toMatchObject({ module_id: 'ranking', label: 'VIEW_MORE' })
      }
      expect(
        clicks.find(value => value.category === 'HOME_SERVICE')
      ).toMatchObject({
        module_id: 'services',
        editorial_position: 1,
        service_id: 'calculator',
        home_variant: 'control'
      })
      expect(await events(page, 'CUSTOM_PAGE_VIEW')).toHaveLength(1)
      await services.scrollIntoViewIfNeeded()
      await ranking.scrollIntoViewIfNeeded()
      await first.scrollIntoViewIfNeeded()
      await page.waitForTimeout(1200)
      expect(
        (await events(page, 'CARD_IMPRESSION')).filter(
          value => value.module_id === moduleId && value.item_position === 1
        )
      ).toHaveLength(1)
    })
  }
})
