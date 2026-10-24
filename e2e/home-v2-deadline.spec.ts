import { test, expect } from './fixtures'

// The isolated Next runtime owns both clocks and WordPress. Never target a
// deployment: the fixture control endpoint only exists on its local test CMS.
const scenario = process.env.HOME_V2_DEADLINE_E2E
test.describe('Cached Home editorial deadlines', () => {
  test.skip(
    !['feature', 'midnight'].includes(scenario ?? ''),
    'Requires the isolated deadline runtime'
  )
  test('replaces expired editorial content without getting stuck', async ({
    page,
    request,
    baseURL
  }) => {
    const clockUrl = process.env.HOME_V2_DEADLINE_CLOCK_URL
    expect(new URL(baseURL!).hostname).toBe('127.0.0.1')
    expect(clockUrl).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/__fixture\/clock$/)
    const initial = Date.parse(
      scenario === 'feature' ? '2026-10-23T15:00:00Z' : '2026-10-23T03:59:58Z'
    )
    const before = scenario === 'feature' ? 'manual' : 'dated'
    await page.clock.setFixedTime(initial)
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)
    expect(response?.headers()['x-nextjs-cache']).toBe('HIT')
    const content = page.locator('#data')
    await expect(content).toBeVisible()
    expect(JSON.parse((await content.textContent())!).featured.id).toBe(before)

    const after = initial + 3000
    const clock = await request.post(clockUrl!, { data: { now: after } })
    expect(clock.status()).toBe(204)
    await page.clock.setFixedTime(after)
    const flights: Promise<unknown>[] = []
    page.on('response', response => {
      if (response.request().headers()['rsc'] !== '1') return
      flights.push(
        response.text().then(body => ({
          status: response.status(),
          cache: response.headers()['x-nextjs-cache'],
          retainsExpiredArticle: body.includes(before)
        }))
      )
    })
    await page.evaluate(() => window.dispatchEvent(new Event('focus')))
    try {
      await expect
        .poll(async () => {
          if (!(await content.count())) return 'waiting'
          return JSON.parse((await content.textContent())!).featured.id
        })
        .toBe('ordinary')
      await expect(page.getByRole('status')).toHaveCount(0)
      expect(flights).toHaveLength(0)
    } finally {
      console.log(
        'deadline responses',
        JSON.stringify({ scenario, flights: await Promise.allSettled(flights) })
      )
    }
  })
})
