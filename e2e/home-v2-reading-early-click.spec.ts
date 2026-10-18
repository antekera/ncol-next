import { test, expect } from './fixtures'

test.describe('Reading attribution before the destination adapter arrives', () => {
  test.skip(
    process.env.HOME_V2_READING_E2E !== 'true',
    'Explicit local reading permission required'
  )
  for (const newTab of [false, true]) {
    test(`persists an early ${newTab ? 'new-tab' : 'normal'} click while the reading chunk is held`, async ({
      page,
      context
    }) => {
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
      let release = () => {}
      let held = false
      const gate = new Promise<void>(resolve => {
        release = resolve
      })
      await context.route('**/_next/static/chunks/**', async route => {
        if (!new URL(route.request().url()).pathname.endsWith('.js'))
          return route.continue()
        const response = await route.fetch()
        const body = await response.text()
        if (body.includes('[data-reading-body]')) {
          held = true
          await gate
        }
        await route.fulfill({ response, body })
      })
      try {
        await page.goto('/?__ncol_home_audit=v2&__ncol_home_measurement=1', {
          waitUntil: 'domcontentloaded'
        })
        await expect.poll(() => held).toBe(true)
        await page.waitForFunction(() =>
          (window.dataLayer ?? []).some(
            value =>
              value &&
              'event' in value &&
              value.event === 'CUSTOM_PAGE_VIEW' &&
              value.home_view_id
          )
        )
        const card = page.locator(
          'section[data-module-id="opening"] article[data-item-position="1"]'
        )
        const id = await card.getAttribute('data-article-id')
        const uri = await card.getAttribute('data-article-uri')
        expect(id).toBeTruthy()
        expect(uri).toMatch(/^\/\d{4}\//)
        const link = card.getByRole('link').first()
        let destination = page
        if (newTab) {
          await link.evaluate(node => {
            ;(node as HTMLAnchorElement).target = '_blank'
          })
          const opened = context.waitForEvent('page')
          await link.click({ noWaitAfter: true })
          destination = await opened
        } else {
          await link.click({ noWaitAfter: true })
        }
        await destination.waitForURL(url => url.pathname === uri, {
          waitUntil: 'domcontentloaded'
        })
        const pending = await destination.evaluate(() =>
          Object.keys(localStorage)
            .filter(key => key.startsWith('ncol:home-v2-origin:v1:'))
            .map(key => JSON.parse(localStorage.getItem(key)!))
        )
        expect(pending).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: uri,
              context: expect.objectContaining({
                article_id: id,
                module_id: 'opening',
                home_variant: 'v2'
              })
            })
          ])
        )
        release()
        await destination.bringToFront()
        await destination
          .locator('[data-reading-heading]')
          .first()
          .scrollIntoViewIfNeeded()
        await expect
          .poll(
            () =>
              destination.evaluate(() =>
                (window.dataLayer ?? []).filter(
                  value =>
                    value &&
                    'event' in value &&
                    value.event === 'ARTICLE_DESTINATION_OPEN'
                )
              ),
            { timeout: 15000 }
          )
          .toEqual([
            expect.objectContaining({
              origin_article_id: id,
              module_id: 'opening',
              home_variant: 'v2'
            })
          ])
      } finally {
        release()
        await context.unrouteAll({ behavior: 'wait' })
      }
    })
  }
})
