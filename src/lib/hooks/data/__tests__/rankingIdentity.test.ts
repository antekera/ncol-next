import useSWR from 'swr'
import { webcrypto } from 'node:crypto'
import { TextEncoder } from 'node:util'
import { useMostVisitedPosts } from '../useMostVisitedPosts'
import { useSidebarRankings } from '../useSidebarRankings'

jest.mock('swr', () => ({ __esModule: true, default: jest.fn(() => ({})) }))

const longPath =
  '/2026/10/18/noticia-con-un-titular-largo-que-necesita-identidad-publica-y-conserva-sus-datos-editoriales-sin-recortar-el-enlace/'
const originalCrypto = Object.getOwnPropertyDescriptor(globalThis, 'crypto')!
const originalEncoder = globalThis.TextEncoder
const originalFetch = globalThis.fetch
const fetchMock = jest.fn()
const post = {
  slug: longPath,
  title: 'Noticia editorial de prueba',
  image: '/image.webp',
  views: 10
}
const runFetcher = async () => {
  const fetcher = jest
    .mocked(useSWR)
    .mock.calls.at(-1)![1] as () => Promise<any>
  return fetcher()
}
beforeEach(() => {
  jest.clearAllMocks()
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    configurable: true
  })
  globalThis.TextEncoder = TextEncoder
  globalThis.fetch = fetchMock
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({ posts: [post] })
  })
})
afterAll(() => {
  Object.defineProperty(globalThis, 'crypto', originalCrypto)
  globalThis.TextEncoder = originalEncoder
  globalThis.fetch = originalFetch
})

it('prepares a bounded public article key before exposing a long ranking URL', async () => {
  useMostVisitedPosts({ load: true })
  const result = await runFetcher()
  expect(result.posts[0]).toEqual({
    ...post,
    homeArticleId:
      'uri_b13ac428c52924eda19d0534e49ac412c6bab113cd595b135488e862203b4325'
  })
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

it('uses the same key for both ranking windows without extra HTTP requests', async () => {
  useSidebarRankings({ load: true })
  const result = await runFetcher()
  expect(result.mostRead[0].homeArticleId).toBe(
    'uri_b13ac428c52924eda19d0534e49ac412c6bab113cd595b135488e862203b4325'
  )
  expect(result.mostViewedToday[0].homeArticleId).toBe(
    'uri_b13ac428c52924eda19d0534e49ac412c6bab113cd595b135488e862203b4325'
  )
  expect(fetchMock).toHaveBeenCalledTimes(2)
})

it('retains short public paths and excludes query or fragment from their identity', async () => {
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({
      posts: [
        {
          ...post,
          slug: 'https://noticiascol.com/2026/10/18/nota?source=test#body'
        }
      ]
    })
  })
  useMostVisitedPosts({ load: true })
  expect((await runFetcher()).posts[0].homeArticleId).toBe('/2026/10/18/nota/')
})

it('keeps navigation data when Web Crypto cannot prepare a long identity', async () => {
  Object.defineProperty(globalThis, 'crypto', {
    value: undefined,
    configurable: true
  })
  useMostVisitedPosts({ load: true })
  const result = await runFetcher()
  expect(result.posts[0]).toEqual({ ...post, homeArticleId: null })
})

it('normalizes a long absolute public URL without sending its query or fragment', async () => {
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({
      posts: [
        {
          ...post,
          slug: `https://noticiascol.com${longPath.slice(0, -1)}?source=test#body`
        }
      ]
    })
  })
  useMostVisitedPosts({ load: true })
  expect((await runFetcher()).posts[0].homeArticleId).toBe(
    'uri_b13ac428c52924eda19d0534e49ac412c6bab113cd595b135488e862203b4325'
  )
})

it('preserves a 100-character path and bounds a 101-character path', async () => {
  const short = `/2026/10/18/${'a'.repeat(87)}/`
  const long = `/2026/10/18/${'a'.repeat(88)}/`
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({
      posts: [
        { ...post, slug: short },
        { ...post, slug: long }
      ]
    })
  })
  useMostVisitedPosts({ load: true })
  const result = await runFetcher()
  expect(result.posts[0].homeArticleId).toBe(short)
  expect(result.posts[1].homeArticleId).toMatch(/^uri_[a-f0-9]{64}$/)
})

it('does not turn services, external URLs or credential-bearing URLs into article keys', async () => {
  const paths = [
    '/dolar-hoy/',
    'https://example.test/2026/10/18/nota/',
    'https://user:pass@noticiascol.com/2026/10/18/nota/'
  ]
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({ posts: paths.map(slug => ({ ...post, slug })) })
  })
  useMostVisitedPosts({ load: true })
  const result = await runFetcher()
  expect(
    result.posts.map((item: { homeArticleId: unknown }) => item.homeArticleId)
  ).toEqual([null, null, null])
  expect(result.posts.map((item: { slug: string }) => item.slug)).toEqual(paths)
})
