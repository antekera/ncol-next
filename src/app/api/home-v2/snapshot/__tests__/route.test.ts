/** @jest-environment node */
import { NextRequest } from 'next/server'
import { GET } from '../route'
import { readPublicHomeSnapshot } from '@lib/homeV2/publicSnapshot'
import { publicHomeSnapshotKey } from '@lib/homeV2/publicCachePolicy'

jest.mock('@lib/homeV2/publicSnapshot', () => ({
  readPublicHomeSnapshot: jest.fn()
}))
const original = process.env
const request = (token = 'recovery-fixture', key = publicHomeSnapshotKey()) =>
  new NextRequest('https://example.com/api/home-v2/snapshot', {
    headers: { authorization: `Bearer ${token}`, 'x-ncol-home-key': key }
  })
beforeEach(() => {
  jest.clearAllMocks()
  process.env = {
    ...original,
    VERCEL: '0',
    HOME_V2_CACHE_NAMESPACE: 'route-fixture',
    HOME_V2_DURABLE_CACHE_ENABLED: 'true',
    CRON_SECRET: 'recovery-fixture'
  }
})
afterEach(() => {
  process.env = original
})

it('remains inaccessible without opt-in and does not read storage', async () => {
  delete process.env.HOME_V2_DURABLE_CACHE_ENABLED
  const response = await GET(request())
  expect(response.status).toBe(404)
  expect(response.headers.get('cache-control')).toBe('no-store')
  expect(readPublicHomeSnapshot).not.toHaveBeenCalled()
})

it.each(['', 'incorrect'])(
  'requires authentication before reading: %s',
  async token => {
    expect((await GET(request(token))).status).toBe(401)
    expect(readPublicHomeSnapshot).not.toHaveBeenCalled()
  }
)

it('rejects all tokens if the server has no secret', async () => {
  delete process.env.CRON_SECRET
  expect((await GET(request())).status).toBe(401)
  expect(readPublicHomeSnapshot).not.toHaveBeenCalled()
})

it('rejects a different deployment namespace before reading', async () => {
  expect(
    (await GET(request('recovery-fixture', 'different-preview'))).status
  ).toBe(409)
  expect(readPublicHomeSnapshot).not.toHaveBeenCalled()
})

it('reads the same snapshot without recursively attempting HTTP recovery', async () => {
  const snapshot = {
    revision: 1,
    fetchedAt: 1000,
    data: { featured: null, sections: {}, regions: [], errors: [] }
  }
  jest.mocked(readPublicHomeSnapshot).mockResolvedValue(snapshot)
  const response = await GET(request())
  expect(response.status).toBe(200)
  expect(response.headers.get('cache-control')).toBe('no-store')
  expect(await response.json()).toEqual({
    key: publicHomeSnapshotKey(),
    snapshot
  })
  expect(readPublicHomeSnapshot).toHaveBeenCalledTimes(1)
  expect(readPublicHomeSnapshot).toHaveBeenCalledWith(false)
})

it('returns a bounded private failure if no healthy cache or provider is available', async () => {
  jest
    .mocked(readPublicHomeSnapshot)
    .mockRejectedValue(new Error('fixture provider error'))
  const response = await GET(request())
  expect(response.status).toBe(503)
  expect(response.headers.get('cache-control')).toBe('no-store')
  expect(await response.json()).toEqual({ error: 'Home snapshot unavailable' })
  expect(readPublicHomeSnapshot).toHaveBeenCalledTimes(1)
})
