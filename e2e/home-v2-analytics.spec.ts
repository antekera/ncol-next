import { test, expect } from './fixtures'

const events = (page: import('@playwright/test').Page) =>
  page.evaluate(() =>
    (window.dataLayer ?? []).filter(
      (value): value is Record<string, unknown> =>
        typeof value === 'object' && value !== null && 'event' in value
    )
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
})

test.describe('Home existing-dataLayer integration, manual local QA', () => {
  test.skip(
    process.env.HOME_V2_MEASUREMENT_E2E !== 'true',
    'Requires a local QA build and opt-in audit server'
  )
  for (const variant of ['control', 'v2']) {
    for (const width of [390, 1440]) {
      test(`${variant} ${width}px: one view, visible impressions and one attributed article click`, async ({
        page
      }) => {
        await page.setViewportSize({ width, height: 1000 })
        await page.goto(
          `/?__ncol_home_audit=${variant}&__ncol_home_measurement=1`
        )
        const root = page.locator(`[data-home-variant="${variant}"]`)
        await expect(root).toBeAttached()
        await expect(root.getByRole('heading', { level: 1 })).toBeVisible()
        await expect
          .poll(
            async () =>
              (await events(page)).filter(
                value => value.event === 'CUSTOM_PAGE_VIEW'
              ).length
          )
          .toBe(1)
        const view = (await events(page)).find(
          value => value.event === 'CUSTOM_PAGE_VIEW'
        )!
        const v2Treatment =
          variant === 'v2'
            ? await root
                .locator('[data-opening-treatment]')
                .getAttribute('data-opening-treatment')
            : 'current'
        expect(view).toMatchObject({
          home_version: variant === 'control' ? 'current' : 'v2',
          opening_treatment: variant === 'control' ? 'current' : v2Treatment,
          pageUrl: '/'
        })
        await expect
          .poll(
            async () =>
              (await events(page)).filter(
                value =>
                  value.event === 'MODULE_IMPRESSION' &&
                  value.module_id === 'opening'
              ).length
          )
          .toBe(1)
        await expect
          .poll(
            async () =>
              (await events(page)).filter(
                value => value.event === 'CARD_IMPRESSION'
              ).length
          )
          .toBeGreaterThan(0)
        const impressions = (await events(page)).filter(
          value => value.event === 'CARD_IMPRESSION'
        )
        expect(
          impressions.every(
            value =>
              value.home_view_id === view.home_view_id &&
              value.module_id &&
              Number(value.editorial_position) > 0
          )
        ).toBe(true)
        expect(
          impressions.some(value =>
            ['latest', 'current-left-2'].includes(String(value.module_id))
          )
        ).toBe(false)
        const card = root.locator('[data-article-id]').first()
        const articleId = await card.getAttribute('data-article-id')
        const link =
          variant === 'control'
            ? card.locator('h1 a')
            : card.locator('a').first()
        await link.click()
        await expect(page).toHaveURL(/\/[^/]+\/\d{2}\/\d{2}\/[^/]+\//)
        const clicks = (await events(page)).filter(
          value => value.event === 'CLICK_EVENT'
        )
        expect(clicks).toHaveLength(1)
        expect(clicks[0]).toMatchObject({
          article_id: articleId,
          module_id: 'opening',
          item_position: 1,
          home_view_id: view.home_view_id,
          category: 'COVER',
          label: 'LINK_COVER'
        })
        const articleView = (await events(page))
          .filter(value => value.event === 'CUSTOM_PAGE_VIEW')
          .at(-1)
        expect(articleView).not.toHaveProperty('experiment_id')
        const cookies = await page.context().cookies()
        expect(
          cookies.filter(cookie =>
            /home.?v2|experiment|variant/i.test(cookie.name)
          )
        ).toEqual([])
      })
    }
  }

  test('V2 region changes preserve the exposure and do not repeat impressions on return', async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 1000 })
    await page.goto('/?__ncol_home_audit=v2&__ncol_home_measurement=1')
    const region = page.locator('section[data-module-id="zulia"]')
    await region.scrollIntoViewIfNeeded()
    await page.waitForTimeout(1100)
    await region.getByRole('button', { name: 'Maracaibo', exact: true }).click()
    await expect(region).toHaveAttribute('data-region-id', 'maracaibo')
    await page.waitForTimeout(1100)
    await region.getByRole('button', { name: 'Maracaibo', exact: true }).click()
    await region
      .getByRole('button', { name: 'Todo Zulia', exact: true })
      .click()
    await expect(region).toHaveAttribute('data-region-id', 'zulia')
    await page.waitForTimeout(1100)
    const all = await events(page)
    const choices = all.filter(value => value.category === 'HOME_REGION_FILTER')
    expect(choices.map(value => value.region_id)).toEqual([
      'maracaibo',
      'zulia'
    ])
    expect(
      all.filter(value => value.event === 'CUSTOM_PAGE_VIEW')
    ).toHaveLength(1)
    const impressions = all.filter(value => value.event === 'CARD_IMPRESSION')
    const keys = impressions.map(value =>
      JSON.stringify([
        value.home_view_id,
        value.module_id,
        value.article_id,
        value.component_type,
        value.item_position
      ])
    )
    expect(new Set(keys).size).toBe(keys.length)
  })

  test('V2 section, service and ranking clicks carry their editorial origin', async ({
    page
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto('/home-v2-preview/')
    const todayUri = await page
      .locator('[data-article-uri]')
      .first()
      .getAttribute('data-article-uri')
    expect(todayUri).toMatch(/^\/\d{4}\/\d{2}\/\d{2}\//)
    await page.route('**/api/most-visited?*', route =>
      route.fulfill({
        status: 200,
        json: {
          posts: [
            {
              slug: '/2020/01/01/expired-ranking/',
              title: 'Jornada del 1 de enero de 2020'
            },
            { slug: todayUri, title: 'Noticia de ranking de hoy' }
          ]
        }
      })
    )
    await page.goto('/?__ncol_home_audit=v2&__ncol_home_measurement=1')
    const root = page.locator('[data-home-variant="v2"]')
    // Keep this gesture inspection on the Home. Real article navigation is
    // exercised above; collectors remain blocked throughout this context.
    await root.evaluate(element =>
      element.addEventListener('click', event => event.preventDefault())
    )
    await root
      .locator(
        '[data-module-id="nacionales"] [data-component-type="section_link"]'
      )
      .click()
    await root
      .locator('[data-module-id="services"] [data-service-id]')
      .first()
      .click()
    const ranking = root
      .locator('[data-module-id="ranking"] [data-article-id]')
      .first()
    await expect(ranking).toBeAttached()
    await expect(root.getByText('Jornada del 1 de enero de 2020')).toHaveCount(
      0
    )
    await expect(ranking).toHaveAttribute('data-item-position', '1')
    await ranking.locator('a').click()
    await expect
      .poll(
        async () =>
          (await events(page)).filter(value => value.event === 'CLICK_EVENT')
            .length
      )
      .toBe(3)
    const clicks = (await events(page)).filter(
      value => value.event === 'CLICK_EVENT'
    )
    expect(clicks[0]).toMatchObject({
      category: 'HOME_SECTION',
      label: 'VIEW_MORE',
      module_id: 'nacionales'
    })
    expect(clicks[1]).toMatchObject({
      category: 'HOME_SERVICE',
      module_id: 'services',
      component_type: 'service_link'
    })
    expect(clicks[2]).toMatchObject({
      category: 'LINK_SINGLE',
      label: 'MOST_VISITED',
      module_id: 'ranking',
      item_position: 1
    })
    expect(clicks.every(value => value.home_version === 'v2')).toBe(true)
  })
})

test('ordinary production build ignores the manual measurement query', async ({
  page
}) => {
  test.skip(
    process.env.HOME_V2_MEASUREMENT_DISABLED_E2E !== 'true',
    'Requires a build with local QA flags disabled'
  )
  await page.goto('/?__ncol_home_audit=control&__ncol_home_measurement=1')
  await expect(page.locator('body')).not.toHaveAttribute(
    'data-home-measurement-qa',
    'true'
  )
  await expect
    .poll(
      async () =>
        (await events(page)).filter(value => value.event === 'CUSTOM_PAGE_VIEW')
          .length
    )
    .toBe(1)
  expect((await events(page)).every(value => !('experiment_id' in value))).toBe(
    true
  )
  const preview = await page.request.get('/home-v2-preview/')
  expect(preview.status()).toBe(404)
})
