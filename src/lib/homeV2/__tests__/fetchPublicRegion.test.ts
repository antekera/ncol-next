import { fetchPublicRegion } from '../fetchPublicRegion'
import type { HomeArticle } from '../types'

const originalFetch = global.fetch
const post: HomeArticle = {
  uri: '/maracaibo/nota/',
  title: 'Noticia regional',
  categories: { edges: [] }
}
const payload = (day = '2026-10-23') => ({
  ok: true,
  articles: [post],
  editorialDay: day,
  cacheUntil: Date.now() + 60000,
  validUntil: Date.parse(`${day}T00:00:00-04:00`) + 86400000
})
let request: jest.Mock
beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date('2026-10-23T18:00:00Z'))
  request = jest.fn()
  global.fetch = request
})
afterEach(() => {
  global.fetch = originalFetch
  jest.useRealTimers()
})

it('fetches one shared public URL without cookies or cache bypass', async () => {
  request.mockResolvedValue({ ok: true, json: async () => payload() })
  const data = await fetchPublicRegion('maracaibo')
  expect(data).toEqual({
    ok: true,
    articles: [post],
    editorialDay: '2026-10-23',
    cacheUntil: Date.now() + 60000
  })
  expect(request).toHaveBeenCalledWith(
    '/api/home-v2/region/2026-10-23/maracaibo',
    { credentials: 'omit' }
  )
  expect(request).toHaveBeenCalledTimes(1)
})

it('retries once with the new day when a cached response crosses midnight', async () => {
  jest.setSystemTime(new Date('2026-10-24T03:59:59Z'))
  request
    .mockResolvedValueOnce({
      ok: true,
      json: async () => {
        jest.setSystemTime(new Date('2026-10-24T04:00:01Z'))
        return payload('2026-10-23')
      }
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => payload('2026-10-24')
    })
  expect((await fetchPublicRegion('maracaibo')).ok).toBe(true)
  expect(request.mock.calls.map(([url]) => url)).toEqual([
    '/api/home-v2/region/2026-10-23/maracaibo',
    '/api/home-v2/region/2026-10-24/maracaibo'
  ])
})

it('accepts a bounded retry when the origin rejects a day that just ended', async () => {
  jest.setSystemTime(new Date('2026-10-24T03:59:59Z'))
  request
    .mockImplementationOnce(async () => {
      jest.setSystemTime(new Date('2026-10-24T04:00:01Z'))
      return { ok: false, status: 410 }
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => payload('2026-10-24')
    })
  expect((await fetchPublicRegion('maracaibo')).ok).toBe(true)
  expect(request).toHaveBeenCalledTimes(2)
})

it.each([
  null,
  { ok: false },
  { ok: true, articles: [null] },
  {
    ok: true,
    articles: [{ uri: '/nota/', title: 'Nota', categories: { edges: [null] } }]
  }
])('rejects malformed regional payloads: %j', async value => {
  request.mockResolvedValue({ ok: true, json: async () => value })
  expect(await fetchPublicRegion('maracaibo')).toEqual({
    ok: false,
    articles: []
  })
  expect(request).toHaveBeenCalledTimes(1)
})

it('does not retry an upstream outage', async () => {
  request.mockResolvedValue({ ok: false, status: 503 })
  expect(await fetchPublicRegion('maracaibo')).toEqual({
    ok: false,
    articles: []
  })
  expect(request).toHaveBeenCalledTimes(1)
})

it('rejects expired or mismatched-day data instead of silently reusing it', async () => {
  request
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...payload(), validUntil: Date.now() - 1 })
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => payload('2026-10-22')
    })
  expect(await fetchPublicRegion('maracaibo')).toEqual({
    ok: false,
    articles: []
  })
  expect(await fetchPublicRegion('maracaibo')).toEqual({
    ok: false,
    articles: []
  })
  expect(request).toHaveBeenCalledTimes(2)
})
