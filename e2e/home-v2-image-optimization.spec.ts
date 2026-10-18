import { test, expect } from './fixtures'
import { declaredImageWidth } from './utils/image-sizes'

// Real optimized response and browser resource selection; not a CWV benchmark.
test.describe('Critical Home V2 image uses the existing optimizer', () => {
  test.skip(
    process.env.HOME_V2_E2E !== 'true',
    'Local photographic QA build only'
  )
  for (const [width, dpr] of [
    [390, 1],
    [390, 2],
    [390, 3],
    [412, 1.75],
    [820, 2],
    [1100, 2],
    [1440, 2]
  ]) {
    test.describe(`${width}px / DPR ${dpr}`, () => {
      test.use({ viewport: { width, height: 900 }, deviceScaleFactor: dpr })
      test('loads one optimized candidate, matches its preload and declares its rendered width', async ({
        page
      }, info) => {
        await page.route(
          /google-analytics\.com\/.*collect|analytics\.google\.com\/.*collect|\/api\/track(?:\?|$)/,
          route => route.fulfill({ status: 204 })
        )
        await page.route(
          /\/rest\/v1\/(?:ads|ad_slot_fallbacks_public)(?:\?|$)/,
          route => route.fulfill({ status: 200, json: [] })
        )
        const images: string[] = []
        const resources = new Map<
          string,
          { format: string; status: number; bytes: number }
        >()
        page.on('request', request => {
          if (request.resourceType() === 'image') images.push(request.url())
        })
        page.on('response', response => {
          if (
            new URL(response.url()).pathname.replace(/\/$/, '') ===
            '/_next/image'
          )
            resources.set(response.url(), {
              format: response.headers()['content-type'] ?? '',
              status: response.status(),
              bytes: Number(response.headers()['content-length'] ?? 0)
            })
        })
        const response = await page.goto('/home-v2-preview/')
        expect(response?.status()).toBe(200)
        const image = page.locator('img[data-home-critical="true"]')
        await expect(image).toBeVisible()
        await expect
          .poll(() =>
            image.evaluate(
              el =>
                (el as HTMLImageElement).complete &&
                (el as HTMLImageElement).naturalWidth > 0
            )
          )
          .toBe(true)
        const candidate = await image.evaluate(
          el => (el as HTMLImageElement).currentSrc
        )
        const url = new URL(candidate)
        expect(url.pathname).toMatch(/^\/_next\/image\/?$/)
        const original = url.searchParams.get('url')!
        expect(new URL(original).hostname).toBe('cdn.noticiascol.com')
        const resource = resources.get(candidate)
        expect(resource?.status).toBe(200)
        expect(resource?.format).toMatch(/^image\/webp/)
        expect(resource?.bytes).toBeGreaterThan(0)
        expect(
          images.filter(
            value =>
              new URL(value).pathname.replace(/\/$/, '') === '/_next/image' &&
              new URL(value).searchParams.get('url') === original
          )
        ).toEqual([candidate])
        expect(images).not.toContain(original)
        const source = image.locator('..').locator('source')
        const hint = page.locator('link[rel="preload"][as="image"]')
        await expect(hint).toHaveAttribute(
          'imagesrcset',
          (await source.getAttribute('srcset'))!
        )
        await expect(hint).toHaveAttribute(
          'imagesizes',
          (await image.getAttribute('sizes'))!
        )
        const widths = await declaredImageWidth(image)
        const cover = await image.evaluate(el => {
          const img = el as HTMLImageElement
          const opening = img.closest('[data-opening-treatment]')
          const photo =
            opening?.getAttribute('data-opening-treatment') === 'photographic'
          const bounds = img.getBoundingClientRect()
          return photo
            ? Math.max(
                bounds.width,
                (bounds.height * img.naturalWidth) / img.naturalHeight
              )
            : bounds.width
        })
        expect(Math.abs(widths.declared - cover)).toBeLessThan(2)
        await info.attach('critical-image-resource', {
          body: JSON.stringify({
            width,
            dpr,
            optimizedWidth: Number(url.searchParams.get('w')),
            resource,
            widths
          }),
          contentType: 'application/json'
        })
        if (
          info.project.name === 'chromium' &&
          ((width === 390 && dpr === 3) || width === 1440)
        ) {
          await info.attach('optimized-editorial-image', {
            body: await page.screenshot(),
            contentType: 'image/png'
          })
        }
      })
    })
  }
})
