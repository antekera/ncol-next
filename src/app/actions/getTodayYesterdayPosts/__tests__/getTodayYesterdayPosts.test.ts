import { getTodayYesterdayPosts } from '..'

jest.mock('@app/actions/fetchAPI', () => ({
  cachedFetchAPI: jest.fn()
}))

import { cachedFetchAPI } from '@app/actions/fetchAPI'

const mockFetch = cachedFetchAPI as jest.Mock

const makeEdge = (daysAgo: number) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return {
    node: {
      id: `id-${daysAgo}`,
      title: `Post ${daysAgo}`,
      uri: `/post-${daysAgo}`,
      date: d.toISOString(),
      categories: { edges: [] }
    }
  }
}

describe('getTodayYesterdayPosts', () => {
  beforeEach(() => jest.clearAllMocks())

  test('returns null when API returns no data', async () => {
    mockFetch.mockResolvedValue(null)
    const result = await getTodayYesterdayPosts({ slug: 'nacionales' })
    expect(result).toBeNull()
  })

  test('returns null when posts field is missing', async () => {
    mockFetch.mockResolvedValue({})
    const result = await getTodayYesterdayPosts({ slug: 'nacionales' })
    expect(result).toBeNull()
  })

  test('filters out posts older than 3 days', async () => {
    const recent = makeEdge(1)
    const old = makeEdge(5)
    mockFetch.mockResolvedValue({ posts: { edges: [recent, old] } })
    const result = await getTodayYesterdayPosts({ slug: 'nacionales' })
    expect(result?.edges).toHaveLength(1)
    expect(result?.edges[0]?.node.id).toBe('id-1')
  })

  test('includes posts from today and within 3 days', async () => {
    const edges = [makeEdge(0), makeEdge(1), makeEdge(2), makeEdge(3)]
    mockFetch.mockResolvedValue({ posts: { edges } })
    const result = await getTodayYesterdayPosts({ slug: 'nacionales' })
    expect(result?.edges.length).toBeGreaterThanOrEqual(3)
  })

  test('returns empty edges array when all posts are too old', async () => {
    mockFetch.mockResolvedValue({
      posts: { edges: [makeEdge(10), makeEdge(7)] }
    })
    const result = await getTodayYesterdayPosts({ slug: 'nacionales' })
    expect(result?.edges).toHaveLength(0)
  })
})
