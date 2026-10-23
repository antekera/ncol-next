import { test, expect } from './fixtures'

const slots = [
  'header',
  'article-top',
  'sidebar',
  'footer',
  'popup',
  'sticky-bottom'
]

test.describe('Home V2 managed advertising', () => {
  test.skip(process.env.HOME_V2_E2E !== 'true', 'Requires the opt-in preview')

  for (const width of [390, 1440]) {
    for (const provider of ['banner', 'html', 'adsense']) {
      test(`${provider} at ${width}px preserves the existing slot contract`, async ({
        page,
        baseURL
      }) => {
        await page.setViewportSize({ width, height: 900 })
        await page.route(
          /google-analytics\.com\/.*collect|analytics\.google\.com\/.*collect|\/api\/track(?:\?|$)/,
          route => route.fulfill({ status: 204 })
        )
        // Verify the configured AdSense unit/queue without requesting live ads.
        await page.route(/googlesyndication\.com|doubleclick\.net/, route =>
          route.abort()
        )
        let directRequests = 0
        let fallbackRequests = 0
        let fallbackSlots = ''
        await page.route(/\/rest\/v1\/ads(?:\?|$)/, route => {
          directRequests++
          return route.fulfill({
            status: 200,
            json:
              provider === 'adsense'
                ? []
                : (provider === 'banner'
                    ? slots
                    : ['article-top', 'footer']
                  ).map(slot => ({
                    id: `qa-${slot}`,
                    type: provider,
                    slot,
                    device_target: 'all',
                    image_url: new URL(`/__home-ad-${slot}.svg`, baseURL).href,
                    image_url_mobile: new URL(`/__home-ad-${slot}.svg`, baseURL)
                      .href,
                    html_content:
                      '<aside aria-label="Campaña propia">Aviso propio</aside>',
                    link_url: 'https://example.com/advertiser'
                  }))
          })
        })
        await page.route(
          /\/rest\/v1\/ad_slot_fallbacks_public(?:\?|$)/,
          route => {
            fallbackRequests++
            fallbackSlots =
              new URL(route.request().url()).searchParams.get('slot') ?? ''
            return route.fulfill({
              status: 200,
              json: [
                {
                  slot: 'article-top',
                  provider: 'adsense',
                  provider_key: null,
                  container_class: null,
                  unit_id: '1234567890'
                },
                {
                  slot: 'footer',
                  provider: 'adsense',
                  provider_key: null,
                  container_class: null,
                  unit_id: '0987654321'
                }
              ]
            })
          }
        )
        await page.route('**/__home-ad-*.svg', route =>
          route.fulfill({
            status: 200,
            contentType: 'image/svg+xml',
            body: `<svg xmlns="http://www.w3.org/2000/svg" width="${route.request().url().includes('footer') && width > 767 ? 970 : 320}" height="100"><rect width="100%" height="100%" fill="#117dbb"/></svg>`
          })
        )

        const response = await page.goto('/home-v2-preview/')
        expect(response?.status()).toBe(200)
        const home = page.locator('[data-home-variant="v2"]')
        await expect(home.getByRole('heading', { level: 1 })).toHaveCount(1)

        if (provider === 'banner') {
          for (const slot of slots) {
            await expect(
              page.locator(`img[src$="/__home-ad-${slot}.svg"]`)
            ).toHaveCount(1)
          }
          const footerBanner = home.locator('img[src$="/__home-ad-footer.svg"]')
          await expect(footerBanner).toHaveCount(1)
          await footerBanner.scrollIntoViewIfNeeded()
          await expect
            .poll(() =>
              footerBanner.evaluate(
                image =>
                  (image as HTMLImageElement).complete &&
                  (image as HTMLImageElement).naturalWidth > 0
              )
            )
            .toBe(true)
          // Read in one frame: lazy ads/images and browser scroll anchoring can
          // change viewport coordinates between independent boundingBox calls.
          const { footerAd, latest, sports } = await home.evaluate(element => ({
            footerAd: element
              .querySelector('img[src$="/__home-ad-footer.svg"]')!
              .getBoundingClientRect()
              .toJSON(),
            latest: element
              .querySelector('section[data-module-id="latest"]')!
              .getBoundingClientRect()
              .toJSON(),
            sports: element
              .querySelector('section[data-module-id="deportes"]')!
              .getBoundingClientRect()
              .toJSON()
          }))
          expect(footerAd).not.toBeNull()
          expect(latest).not.toBeNull()
          expect(sports).not.toBeNull()
          expect(footerAd!.y + footerAd!.height).toBeLessThanOrEqual(sports!.y)
          expect(footerAd!.width).toBeLessThanOrEqual(latest!.width)
          expect(footerAd!.x).toBeGreaterThanOrEqual(latest!.x)
          expect(footerAd!.x + footerAd!.width).toBeLessThanOrEqual(
            latest!.x + latest!.width + 0.5
          )
          const creative = home.locator(
            'img[src$="/__home-ad-article-top.svg"]'
          )
          await creative.scrollIntoViewIfNeeded()
          const { ad, opening, regional } = await home.evaluate(element => ({
            ad: element
              .querySelector('img[src$="/__home-ad-article-top.svg"]')!
              .getBoundingClientRect()
              .toJSON(),
            opening: element
              .querySelector('section[data-module-id="opening"]')!
              .getBoundingClientRect()
              .toJSON(),
            regional: element
              .querySelector('section[data-module-id="zulia"]')!
              .getBoundingClientRect()
              .toJSON()
          }))
          expect(ad).not.toBeNull()
          expect(ad!.y).toBeGreaterThanOrEqual(opening!.y + opening!.height)
          expect(ad!.y + ad!.height).toBeLessThanOrEqual(regional!.y)
          expect(ad!.width).toBeGreaterThan(0)
        } else if (provider === 'html') {
          await expect(
            home.getByRole('complementary', { name: 'Campaña propia' })
          ).toHaveCount(2)
        } else {
          await expect(
            home.locator('ins[data-ad-slot="1234567890"]')
          ).toHaveCount(1)
          expect(
            await home
              .locator('ins[data-ad-slot="1234567890"]')
              .evaluate(el => el.getBoundingClientRect().width)
          ).toBeGreaterThan(0)
          await expect
            .poll(() => page.evaluate(() => window.adsbygoogle?.length ?? 0))
            .toBe(2)
          await expect(
            home.locator('ins[data-ad-slot="0987654321"]')
          ).toHaveCount(1)
          await expect(
            page.locator('ins[data-ad-slot="0987654321"]')
          ).toHaveCount(1)
        }

        await expect.poll(() => fallbackRequests).toBe(1)
        expect(directRequests).toBe(1)
        expect(fallbackSlots.includes('article-top')).toBe(
          provider === 'adsense'
        )
        if (provider !== 'adsense') {
          await expect(
            page.locator('ins[data-ad-slot="1234567890"]')
          ).toHaveCount(0)
        }
        expect(
          await home.evaluate(el => el.scrollWidth <= el.clientWidth)
        ).toBe(true)
      })
    }
  }
  for (const width of [390, 768, 1024, 1440, 1920]) {
    test(`${width}px: empty sidebar collapses, filled ads return and control keeps its footer`, async ({
      page,
      baseURL
    }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.route(
        /google-analytics\.com|analytics\.google\.com|\/api\/track(?:\?|$)/,
        r => r.fulfill({ status: 204 })
      )
      await page.route(/\/rest\/v1\/ads(?:\?|$)/, r =>
        r.fulfill({
          status: 200,
          json: [
            {
              id: 'qa-footer',
              type: 'banner',
              slot: 'footer',
              device_target: 'all',
              image_url: new URL('/__footer-moved.svg', baseURL).href,
              image_url_mobile: new URL('/__footer-moved.svg', baseURL).href,
              link_url: 'https://example.com/advertiser'
            }
          ]
        })
      )
      await page.route(/\/rest\/v1\/ad_slot_fallbacks_public(?:\?|$)/, r =>
        r.fulfill({
          status: 200,
          json: [
            {
              slot: 'sidebar',
              provider: 'third_party',
              provider_key: 'clever',
              container_class: 'clever-core-ads',
              unit_id: null
            }
          ]
        })
      )
      await page.route('**/__footer-moved.svg', r =>
        r.fulfill({
          contentType: 'image/svg+xml',
          body: `<svg xmlns="http://www.w3.org/2000/svg" width="${width < 768 ? 320 : 970}" height="100"/>`
        })
      )
      await page.goto('/home-v2-preview/')
      const target = page.locator('[data-ncol-slot="sidebar"]')
      await expect(target).toHaveCount(1)
      const frame = target.locator('..')
      await expect
        .poll(() => frame.evaluate(el => el.getBoundingClientRect().height))
        .toBe(0)
      const panel = frame.locator('..')
      await expect(panel).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      if (width >= 768) {
        const sidebars = page.locator(
          '[data-home-variant="v2"] aside[aria-label]'
        )
        await expect(sidebars).toHaveCount(2)
        for (const sidebar of await sidebars.all()) {
          expect((await sidebar.boundingBox())!.width).toBeGreaterThanOrEqual(
            300
          )
        }
      }
      await target.evaluate(el => {
        const creative = document.createElement('iframe')
        creative.title = 'Aviso de prueba'
        creative.style.width = '300px'
        creative.style.height = '250px'
        el.append(creative)
      })
      await expect
        .poll(() => frame.evaluate(el => el.getBoundingClientRect().height))
        .toBe(width < 768 ? 250 : 600)
      if (width >= 768) {
        const creative = await target.locator('iframe').boundingBox()
        const sidebar = await target
          .locator('xpath=ancestor::aside')
          .boundingBox()
        expect(creative!.width).toBe(300)
        expect(creative!.x).toBeGreaterThanOrEqual(sidebar!.x)
        expect(creative!.x + creative!.width).toBeLessThanOrEqual(
          sidebar!.x + sidebar!.width
        )
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth)
        ).toBe(width)
      }
      await target.evaluate(el => el.replaceChildren())
      await expect
        .poll(() => frame.evaluate(el => el.getBoundingClientRect().height))
        .toBe(0)
      await expect(
        page.locator('main img[src$="/__footer-moved.svg"]')
      ).toHaveCount(1)
      await page.goto('/')
      await expect(page.locator('img[src$="/__footer-moved.svg"]')).toHaveCount(
        1
      )
      await expect(
        page.locator('main img[src$="/__footer-moved.svg"]')
      ).toHaveCount(0)
      await expect(page.locator('footer')).toBeAttached()
    })
  }
})
