/** @jest-environment node */
import { NextRequest } from 'next/server'
import { GET, POST } from '../route'
import { refreshPublicHomeSnapshot } from '@lib/homeV2/publicSnapshot'

jest.mock('@lib/homeV2/publicSnapshot', () => ({
  refreshPublicHomeSnapshot: jest.fn()
}))
jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn() }))
const original = process.env
const request = (token = 'processor-fixture') =>
  new NextRequest('https://example.com/api/home-v2/refresh/', {
    headers: { authorization: `Bearer ${token}` }
  })
beforeEach(() => {
  jest.clearAllMocks()
  process.env = {
    ...original,
    HOME_V2_PUBLIC_ENABLED: 'false',
    HOME_V2_DURABLE_CACHE_ENABLED: 'true',
    CRON_SECRET: 'processor-fixture'
  }
})
afterEach(() => {
  process.env = original
})

it('stays inaccessible without the cache opt-in, without touching storage', async () => {
  delete process.env.HOME_V2_DURABLE_CACHE_ENABLED
  const response = await GET(request())
  expect(response.status).toBe(404)
  expect(response.headers.get('cache-control')).toBe('no-store')
  expect(refreshPublicHomeSnapshot).not.toHaveBeenCalled()
})

it.each(['', 'incorrect'])(
  'requires authentication before storage: %s',
  async token => {
    expect((await GET(request(token))).status).toBe(401)
    expect(refreshPublicHomeSnapshot).not.toHaveBeenCalled()
  }
)

it('does not accept a bearer token when the server secret is missing', async () => {
  delete process.env.CRON_SECRET
  expect((await GET(request())).status).toBe(401)
  expect(refreshPublicHomeSnapshot).not.toHaveBeenCalled()
})

it('supports protected prewarm with the public Home still disabled', async () => {
  jest
    .mocked(refreshPublicHomeSnapshot)
    .mockResolvedValue({ status: 'updated' })
  const response = await POST(request())
  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({ ok: true, status: 'updated' })
  expect(response.headers.get('cache-control')).toBe('no-store')
  expect(refreshPublicHomeSnapshot).toHaveBeenCalledTimes(1)
})

it('returns a noncacheable failure instead of claiming a refresh succeeded', async () => {
  jest
    .mocked(refreshPublicHomeSnapshot)
    .mockRejectedValue(new Error('fixture CMS error'))
  const response = await GET(request())
  expect(response.status).toBe(503)
  expect(response.headers.get('cache-control')).toBe('no-store')
  expect(await response.json()).toEqual({ error: 'Home refresh unavailable' })
})
