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
                : (provider === 'banner' ? slots : ['article-top']).map(
                    slot => ({
                      id: `qa-${slot}`,
                      type: provider,
                      slot,
                      device_target: 'all',
                      image_url: new URL(`/__home-ad-${slot}.svg`, baseURL)
                        .href,
                      image_url_mobile: new URL(
                        `/__home-ad-${slot}.svg`,
                        baseURL
                      ).href,
                      html_content:
                        '<aside aria-label="Campaña propia">Aviso propio</aside>',
                      link_url: 'https://example.com/advertiser'
                    })
                  )
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
                }
              ]
            })
          }
        )
        await page.route('**/__home-ad-*.svg', route =>
          route.fulfill({
            status: 200,
            contentType: 'image/svg+xml',
            body: '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="100"><rect width="100%" height="100%" fill="#117dbb"/></svg>'
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
          const creative = home.locator(
            'img[src$="/__home-ad-article-top.svg"]'
          )
          await creative.scrollIntoViewIfNeeded()
          const ad = await creative.boundingBox()
          const opening = await home
            .locator('section[data-module-id="opening"]')
            .boundingBox()
          const regional = await home
            .locator('section[data-module-id="zulia"]')
            .boundingBox()
          expect(ad).not.toBeNull()
          expect(ad!.y).toBeGreaterThanOrEqual(opening!.y + opening!.height)
          expect(ad!.y + ad!.height).toBeLessThanOrEqual(regional!.y)
          expect(ad!.width).toBeGreaterThan(0)
        } else if (provider === 'html') {
          await expect(
            home.getByRole('complementary', { name: 'Campaña propia' })
          ).toHaveCount(1)
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
            .toBe(1)
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
})
