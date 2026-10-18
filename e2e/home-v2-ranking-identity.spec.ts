import { createHash } from 'node:crypto'
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

test.describe('Ranking identity and destination attribution, local QA', () => {
  test.skip(
    process.env.HOME_V2_READING_E2E !== 'true',
    'Requires the local reading QA build and audit server'
  )
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
      localStorage.setItem('ncol_wa_dismissed', 'true')
      localStorage.setItem('ncol_fb_dismissed', 'true')
    })
  })
  for (const variant of ['control', 'v2']) {
    for (const width of [390, 1440]) {
      test(`${variant} ${width}px: long ranking URI joins one click, destination and second news`, async ({
        page,
        context
      }, info) => {
        await page.setViewportSize({ width, height: 1000 })
        // Use real public destination articles. Only the ranking feed is fixed;
        // no fabricated article route, DOM identity mutation or CMS write.
        await page.goto('/home-v2-preview/')
        const candidates = await page
          .locator('[data-article-id][data-article-uri]')
          .evaluateAll(nodes =>
            nodes
              .map(node => ({
                id: node.getAttribute('data-article-id')!,
                uri: node.getAttribute('data-article-uri')!,
                title: node.textContent!.trim()
              }))
              .filter(
                item => /^\/\d{4}\//.test(item.uri) && !item.id.startsWith('/')
              )
          )
        const first = candidates.find(item => item.uri.length > 100)
        expect(
          first,
          'real public article with a canonical URI longer than 100 characters'
        ).toBeTruthy()
        const second = candidates.find(item => item.id !== first!.id)
        expect(second).toBeTruthy()
        const key = `uri_${createHash('sha256').update(first!.uri).digest('hex')}`
        const requests: Record<string, number> = {}
        const auditUrl = new URL(
          `/?__ncol_home_audit=${variant}&__ncol_home_measurement=1`,
          page.url()
        ).href
        await page.route('**/api/most-visited?*', route => {
          const query = new URL(route.request().url()).search
          // A late request from the preparation preview is a different visit.
          // Count duplicates within the audited document, not across both.
          if (route.request().headers().referer === auditUrl)
            requests[query] = (requests[query] ?? 0) + 1
          return route.fulfill({
            status: 200,
            json: {
              posts: [
                { slug: first!.uri, title: first!.title, image: '/favicon.ico' }
              ]
            }
          })
        })
        await page.goto(auditUrl)
        const root = page.locator(`[data-home-variant="${variant}"]`)
        const section = root
          .locator('section[data-module-id^="ranking"]:visible')
          .first()
        await section.scrollIntoViewIfNeeded()
        const card = section.locator('[data-article-id]').first()
        await expect(card).toHaveAttribute('data-article-id', key)
        expect(
          new URL((await card.getAttribute('data-article-uri'))!, page.url())
            .pathname
        ).toBe(first!.uri)
        await card.scrollIntoViewIfNeeded()
        await card.evaluate(node => node.scrollIntoView({ block: 'center' }))
        await page.bringToFront()
        const moduleId = await section.getAttribute('data-module-id')
        await expect
          .poll(
            async () => {
              // Client columns can grow above the control's mobile ranking.
              // Keep it in view until the real observer records its full second.
              await card.scrollIntoViewIfNeeded()
              return (await events(page, 'CARD_IMPRESSION')).filter(
                event =>
                  event.article_id === key && event.module_id === moduleId
              ).length
            },
            { timeout: 15000, intervals: [1500] }
          )
          .toBe(1)
        const link = card.getByRole('link').first()
        expect(
          new URL((await link.getAttribute('href'))!, page.url()).origin
        ).toBe(new URL(page.url()).origin)
        await expect(link).toHaveAttribute(
          'href',
          new RegExp(first!.uri.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$')
        )
        await link.evaluate(node => {
          ;(node as HTMLAnchorElement).target = '_blank'
        })
        const opened = context.waitForEvent('page')
        await link.click()
        const tab = await opened
        await tab.setViewportSize({ width, height: 1000 })
        await tab.bringToFront()
        await expect
          .poll(
            async () => (await events(tab, 'ARTICLE_DESTINATION_OPEN')).length
          )
          .toBe(1)
        expect(
          (await events(tab, 'ARTICLE_DESTINATION_OPEN'))[0]
        ).toMatchObject({
          home_variant: variant,
          module_id: moduleId,
          origin_article_id: key,
          article_id: first!.id
        })
        const clicks = (await events(page, 'CLICK_EVENT')).filter(
          event => event.article_id === key
        )
        expect(clicks).toHaveLength(1)
        expect(clicks[0]).toMatchObject({
          home_variant: variant,
          module_id: moduleId,
          item_position: 1
        })
        await tab.goto(second!.uri)
        await tab.bringToFront()
        await expect
          .poll(async () => (await events(tab, 'SECOND_ARTICLE_OPEN')).length)
          .toBe(1)
        expect((await events(tab, 'SECOND_ARTICLE_OPEN'))[0]).toMatchObject({
          home_variant: variant,
          module_id: moduleId,
          origin_article_id: key,
          first_article_id: first!.id,
          article_id: second!.id
        })
        await tab.reload()
        await tab.bringToFront()
        await expect(
          tab.locator('[data-reading-article-id]').first()
        ).toBeAttached()
        await tab.waitForTimeout(1200)
        expect(await events(tab, 'ARTICLE_DESTINATION_OPEN')).toHaveLength(0)
        expect(await events(tab, 'SECOND_ARTICLE_OPEN')).toHaveLength(0)
        await tab.close()
        expect(
          (await events(page, 'CARD_IMPRESSION')).filter(
            event => event.article_id === key && event.module_id === moduleId
          )
        ).toHaveLength(1)
        expect(Object.values(requests).length).toBeGreaterThan(0)
        expect(Object.values(requests).every(count => count === 1)).toBe(true)
        await info.attach('ranking-identity', {
          contentType: 'application/json',
          body: JSON.stringify({
            variant,
            width,
            moduleId,
            uriLength: first!.uri.length,
            keyLength: key.length,
            firstId: first!.id,
            secondId: second!.id,
            requests,
            sourceClicks: clicks.length
          })
        })
      })
    }
  }
})
