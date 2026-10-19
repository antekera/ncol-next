/** @jest-environment node */
import { GET } from '../route'
import { getOpinionAuthors } from '@app/actions/getOpinionAuthors'
jest.mock('@app/actions/getOpinionAuthors', () => ({
  getOpinionAuthors: jest.fn()
}))
afterEach(() => jest.clearAllMocks())
it('caches only the public author list at the CDN for thirty minutes', async () => {
  jest.mocked(getOpinionAuthors).mockResolvedValue([])
  const response = await GET()
  expect(response.status).toBe(200)
  expect(await response.json()).toEqual([])
  expect(response.headers.get('cache-control')).toBe(
    'public, max-age=0, s-maxage=1800, stale-while-revalidate=60'
  )
  expect(response.headers.has('set-cookie')).toBe(false)
})
it('returns an uncached failure when WordPress fails instead of a cacheable empty list', async () => {
  jest.mocked(getOpinionAuthors).mockRejectedValue(new Error('CMS offline'))
  const response = await GET()
  expect(response.status).toBe(503)
  expect(response.headers.get('cache-control')).toBe('no-store')
  expect(await response.json()).toEqual({
    error: 'Opinion authors unavailable'
  })
})
