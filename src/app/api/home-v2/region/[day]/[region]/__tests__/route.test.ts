/** @jest-environment node */
import { GET } from '../route'
import { getHomeV2RegionData } from '@lib/homeV2/getHomeV2RegionData'

jest.mock('@lib/homeV2/getHomeV2RegionData', () => ({
  getHomeV2RegionData: jest.fn()
}))
const original = process.env
beforeEach(() => {
  jest.clearAllMocks()
  jest.useFakeTimers().setSystemTime(new Date('2026-10-23T18:00:00Z'))
  process.env = { ...original, HOME_V2_PUBLIC_ENABLED: 'true' }
})
afterEach(() => {
  process.env = original
  jest.useRealTimers()
})
const context = (day = '2026-10-23', region = 'maracaibo') => ({
  params: Promise.resolve({ day, region })
})

it('shares public regional data without extending its original freshness window', async () => {
  jest.mocked(getHomeV2RegionData).mockResolvedValue({
    ok: true,
    articles: [],
    fetchedAt: Date.parse('2026-10-23T17:58:00Z')
  })
  const response = await GET(new Request('https://example.com/'), context())
  expect(response.status).toBe(200)
  expect(response.headers.get('Cache-Control')).toBe(
    'public, max-age=0, must-revalidate'
  )
  expect(response.headers.get('CDN-Cache-Control')).toBe(
    'public, s-maxage=180, stale-while-revalidate=0'
  )
  expect(response.headers.has('Set-Cookie')).toBe(false)
  expect(await response.json()).toEqual({
    ok: true,
    articles: [],
    editorialDay: '2026-10-23',
    validUntil: Date.parse('2026-10-24T04:00:00Z'),
    cacheUntil: Date.parse('2026-10-23T18:03:00Z')
  })
  expect(getHomeV2RegionData).toHaveBeenCalledWith('maracaibo')
})

it('stays unavailable before public launch without reading WordPress', async () => {
  process.env.HOME_V2_PUBLIC_ENABLED = 'false'
  const response = await GET(new Request('https://example.com/'), context())
  expect(response.status).toBe(404)
  expect(response.headers.get('Cache-Control')).toBe('no-store')
  expect(getHomeV2RegionData).not.toHaveBeenCalled()
})

it.each(['2026-10-22', '2026-10-24'])(
  'does not cache another editorial day: %s',
  async day => {
    const response = await GET(
      new Request('https://example.com/'),
      context(day)
    )
    expect(response.status).toBe(410)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(getHomeV2RegionData).not.toHaveBeenCalled()
  }
)

it('caps edge freshness at Caracas midnight', async () => {
  jest.setSystemTime(new Date('2026-10-24T03:59:50Z'))
  jest.mocked(getHomeV2RegionData).mockResolvedValue({
    ok: true,
    articles: [],
    fetchedAt: Date.parse('2026-10-24T03:59:49Z')
  })
  const response = await GET(new Request('https://example.com/'), context())
  expect(response.headers.get('CDN-Cache-Control')).toBe(
    'public, s-maxage=10, stale-while-revalidate=0'
  )
  expect((await response.json()).cacheUntil).toBe(
    Date.parse('2026-10-24T04:00:00Z')
  )
})

it('does not cache a snapshot whose freshness has elapsed', async () => {
  jest.mocked(getHomeV2RegionData).mockResolvedValue({
    ok: true,
    articles: [],
    fetchedAt: Date.parse('2026-10-23T17:50:00Z')
  })
  const response = await GET(new Request('https://example.com/'), context())
  expect(response.status).toBe(200)
  expect(response.headers.get('Cache-Control')).toBe('no-store')
  expect(response.headers.get('CDN-Cache-Control')).toBe('no-store')
})

it('rejects an old-day request that crosses midnight while loading', async () => {
  jest.mocked(getHomeV2RegionData).mockImplementation(async () => {
    jest.setSystemTime(new Date('2026-10-24T04:00:01Z'))
    return { ok: true, articles: [], fetchedAt: Date.now() }
  })
  const response = await GET(new Request('https://example.com/'), context())
  expect(response.status).toBe(410)
  expect(response.headers.get('Cache-Control')).toBe('no-store')
})

it('keeps failed upstream responses uncacheable', async () => {
  jest
    .mocked(getHomeV2RegionData)
    .mockResolvedValue({ ok: false, articles: [] })
  const response = await GET(new Request('https://example.com/'), context())
  expect(response.status).toBe(503)
  expect(response.headers.get('Cache-Control')).toBe('no-store')
  expect(response.headers.get('CDN-Cache-Control')).toBe('no-store')
})
