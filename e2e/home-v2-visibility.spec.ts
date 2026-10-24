import { test, expect } from './fixtures'
import type { Page, Locator } from '@playwright/test'

type Overlay = 'menu' | 'login' | 'popup' | 'sticky' | 'social'
const count = (page: Page, id: string, module: string) =>
  page.evaluate(
    ({ id, module }) =>
      (window.dataLayer ?? []).filter(
        value =>
          typeof value === 'object' &&
          value !== null &&
          'event' in value &&
          value.event === 'CARD_IMPRESSION' &&
          'article_id' in value &&
          value.article_id === id &&
          'module_id' in value &&
          value.module_id === module
      ).length,
    { id, module }
  )

async function openOverlay(page: Page, kind: Overlay): Promise<Locator> {
  if (kind === 'menu') {
    await page
      .getByRole('button', {
        name: 'menú de categorías y búsqueda',
        exact: true
      })
      .click()
    return page.locator('[data-home-occluder="menu-backdrop"]')
  }
  if (kind === 'login') {
    await page
      .getByRole('button', { name: 'Iniciar sesión', exact: true })
      .click()
    return page.locator('[data-slot="dialog-overlay"]')
  }
  const name = kind === 'social' ? 'social-banner' : `ad-${kind}`
  return page.locator(`[data-home-occluder="${name}"]`)
}

async function closeOverlay(page: Page, kind: Overlay, overlay: Locator) {
  if (kind === 'menu') await overlay.click({ position: { x: 10, y: 10 } })
  else if (kind === 'login')
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Cerrar', exact: true })
      .click()
  else if (kind === 'social')
    await overlay.getByRole('button', { name: 'Quitar', exact: true }).click()
  else
    await page
      .getByRole('button', { name: 'Cerrar anuncio', exact: true })
      .click()
}

test.describe('Visible editorial area behind actual owned overlays', () => {
  test.use({ actionTimeout: 10_000 })
  test.skip(
    process.env.HOME_V2_MEASUREMENT_E2E !== 'true',
    'Requires the local QA build and server; no public experiment'
  )
  for (const kind of ['menu', 'login', 'popup', 'sticky', 'social'] as const) {
    for (const width of [390, 1440]) {
      test(`${kind} ${width}px cancels coverage and requires a fresh visible second`, async ({
        page
      }) => {
        await page.setViewportSize({
          width,
          height: kind === 'social' ? 400 : 900
        })
        await page.addInitScript(showSocial => {
          localStorage.setItem('ncol_fb_dismissed', 'true')
          if (!showSocial) localStorage.setItem('ncol_wa_dismissed', 'true')
        }, kind === 'social')
        await page.route(
          /google-analytics\.com\/.*collect|analytics\.google\.com\/.*collect|\/api\/track(?:\?|$)/,
          route => route.fulfill({ status: 204 })
        )
        await page.route(
          /\/rest\/v1\/ad_slot_fallbacks_public(?:\?|$)/,
          route => route.fulfill({ status: 200, json: [] })
        )
        await page.route(/\/api\/opinion\/authors\/?(?:\?|$)/, route =>
          route.fulfill({
            json: [
              {
                name: 'Columnista QA',
                slug: 'columnista-qa',
                uri: '/autor/columnista-qa/',
                avatarUrl: null,
                latestPost: {
                  id: 'opinion-visible-qa',
                  title: 'Columna de prueba sin fecha de validez',
                  uri: '/2026/10/23/columna-visible-qa/'
                }
              }
            ]
          })
        )
        await page.route(/\/rest\/v1\/ads(?:\?|$)/, route =>
          route.fulfill({
            status: 200,
            json:
              kind === 'popup' || kind === 'sticky'
                ? [
                    {
                      id: `qa-occlusion-${kind}`,
                      type: 'html',
                      slot: kind === 'popup' ? 'popup' : 'sticky-bottom',
                      device_target: 'all',
                      image_url: null,
                      image_url_mobile: null,
                      html_content:
                        '<div style="width:300px;height:260px;background:#117dbb">Creatividad de QA</div>',
                      link_url: null,
                      link_url_desktop: null,
                      link_url_ios: null,
                      link_url_android: null
                    }
                  ]
                : []
          })
        )
        await page.goto('/?__ncol_home_audit=v2&__ncol_home_measurement=1', {
          waitUntil: 'domcontentloaded'
        })
        await expect(page.locator('[data-home-variant="v2"]')).toBeVisible()
        await expect
          .poll(() =>
            page.evaluate(
              () =>
                (window.dataLayer ?? []).filter(
                  value =>
                    typeof value === 'object' &&
                    value !== null &&
                    'event' in value &&
                    value.event === 'CUSTOM_PAGE_VIEW' &&
                    'home_version' in value &&
                    value.home_version === 'v2'
                ).length
            )
          )
          .toBe(1)
        const overlay = await openOverlay(page, kind)
        await expect(overlay).toBeVisible()
        // The actual menu/social components animate for up to 300 ms.
        await page.waitForTimeout(350)
        let module = 'deportes'
        if (width === 1440 && kind === 'social') module = 'opinion'
        // The 300px sidebar places the centered sticky ad between the lower
        // columns. A Zulia compact card is actually coverable by more than 50%.
        if (width === 1440 && kind === 'sticky') module = 'zulia'
        if (width === 1440 && kind === 'social')
          // Load the actual lazy feed while its column is already occluded.
          await page
            .locator('section[data-module-id="opinion"]')
            .scrollIntoViewIfNeeded()
        const cards = page.locator(
          `section[data-module-id="${module}"] [data-article-id]`
        )
        const card =
          kind === 'sticky' && width === 1440
            ? cards.nth(1)
            : kind === 'social'
              ? cards.last()
              : cards.first()
        await expect(card).toBeAttached()
        const id = (await card.getAttribute('data-article-id'))!
        expect(await count(page, id, module)).toBe(0)
        const overlayBox = (await overlay.boundingBox())!
        await card.evaluate(
          (element, { kind, center }) => {
            const box = element.getBoundingClientRect()
            const desiredTop =
              kind === 'sticky'
                ? window.innerHeight - box.height
                : center - box.height / 2
            window.scrollBy(0, box.top - desiredTop)
          },
          { kind, center: overlayBox.y + overlayBox.height / 2 }
        )
        const intersecting = await card.evaluate(
          element =>
            new Promise<number>(resolve => {
              const observer = new IntersectionObserver(entries => {
                observer.disconnect()
                resolve(entries[0].intersectionRatio)
              })
              observer.observe(element)
            })
        )
        // Geometry alone says visible while the owned surface covers it.
        expect(intersecting).toBeGreaterThanOrEqual(0.5)
        const box = (await card.boundingBox())!
        const overlap =
          Math.max(
            0,
            Math.min(box.x + box.width, overlayBox.x + overlayBox.width) -
              Math.max(box.x, overlayBox.x)
          ) *
          Math.max(
            0,
            Math.min(box.y + box.height, overlayBox.y + overlayBox.height) -
              Math.max(box.y, overlayBox.y)
          )
        expect(overlap / (box.width * box.height)).toBeGreaterThan(0.5)
        await page.waitForTimeout(1300)
        expect(await count(page, id, module)).toBe(0)
        await closeOverlay(page, kind, overlay)
        // Modal focus restoration may scroll to its trigger. Bring the same
        // placement back into view; this must still start a fresh dwell.
        await card.evaluate(element =>
          element.scrollIntoView({ block: 'center' })
        )
        await page.waitForTimeout(700)
        expect(await count(page, id, module)).toBe(0)
        await expect.poll(() => count(page, id, module)).toBe(1)
        await page.waitForTimeout(400)
        expect(await count(page, id, module)).toBe(1)
        if (kind === 'popup' || kind === 'sticky') {
          const nativeViews = await page.evaluate(
            kind =>
              Object.keys(localStorage)
                .filter(key => key.startsWith(`ncol_v_qa-occlusion-${kind}_`))
                .map(key => localStorage.getItem(key)),
            kind
          )
          expect(nativeViews).toEqual(['1'])
        }
      })
    }
  }
})
