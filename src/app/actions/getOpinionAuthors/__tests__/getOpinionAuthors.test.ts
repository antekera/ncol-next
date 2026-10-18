import { getOpinionAuthors } from '..'
import { fetchAPI } from '@app/actions/fetchAPI'

jest.mock('@app/actions/fetchAPI', () => ({ fetchAPI: jest.fn() }))
const node = (id: string, author: number) => ({
  id,
  title: `Columna ${id}`,
  uri: `/2026/10/18/${id}/`,
  author: {
    node: {
      databaseId: author,
      name: `Autor ${author}`,
      slug: `autor-${author}`,
      uri: `/autor/autor-${author}/`,
      avatar: { url: `https://example.com/avatar-${author}.jpg` }
    }
  }
})
const originalFetch = global.fetch
const oldUrl = process.env.WORDPRESS_OPINION_API_URL
const oldSecret = process.env.WORDPRESS_OPINION_API_SECRET
beforeEach(() => {
  jest.clearAllMocks()
  process.env.WORDPRESS_OPINION_API_URL = 'https://wp.example/wp-json/ncol/v1'
  process.env.WORDPRESS_OPINION_API_SECRET = 'test-secret'
})
afterEach(() => {
  global.fetch = originalFetch
  if (oldUrl === undefined) delete process.env.WORDPRESS_OPINION_API_URL
  else process.env.WORDPRESS_OPINION_API_URL = oldUrl
  if (oldSecret === undefined) delete process.env.WORDPRESS_OPINION_API_SECRET
  else process.env.WORDPRESS_OPINION_API_SECRET = oldSecret
})

it('fetches independent photos concurrently while preserving editorial order, unique authors and public post IDs', async () => {
  jest.mocked(fetchAPI).mockResolvedValue({
    posts: {
      edges: [
        { node: node('post-1', 11) },
        { node: node('post-duplicate-author', 11) },
        { node: node('post-2', 22) },
        { node: node('post-outside-limit', 33) }
      ]
    }
  })
  const started: string[] = []
  const releases: Array<() => void> = []
  let released = false
  global.fetch = jest.fn().mockImplementation((url: string) => {
    started.push(url)
    const response = {
      ok: true,
      json: async () => ({
        foto_perfil_url: url.endsWith('/11/photo')
          ? 'https://example.com/portrait-11.jpg'
          : ''
      })
    }
    if (released) return Promise.resolve(response)
    return new Promise(resolve => releases.push(() => resolve(response)))
  })
  const work = getOpinionAuthors(2)
  let result: Awaited<typeof work> | undefined
  try {
    await Promise.resolve()
    await Promise.resolve()
    expect(started).toEqual([
      'https://wp.example/wp-json/ncol/v1/users/11/photo',
      'https://wp.example/wp-json/ncol/v1/users/22/photo'
    ])
  } finally {
    released = true
    releases.reverse()
    for (const release of releases) release()
    result = await work
  }
  expect(result?.map(author => author.latestPost)).toEqual([
    { id: 'post-1', title: 'Columna post-1', uri: '/2026/10/18/post-1/' },
    { id: 'post-2', title: 'Columna post-2', uri: '/2026/10/18/post-2/' }
  ])
  expect(result?.map(author => author.avatarUrl)).toEqual([
    'https://example.com/portrait-11.jpg',
    'https://example.com/avatar-22.jpg'
  ])
  expect(fetchAPI).toHaveBeenCalledTimes(1)
  expect(fetchAPI).toHaveBeenCalledWith(
    expect.objectContaining({ variables: { qty: 10 } })
  )
  expect(global.fetch).toHaveBeenCalledTimes(2)
  expect(global.fetch).toHaveBeenCalledWith(
    'https://wp.example/wp-json/ncol/v1/users/11/photo',
    {
      cache: 'no-store',
      headers: { 'x-opinion-secret': 'test-secret' }
    }
  )
})

it('preserves avatar fallbacks on HTTP and network failures without losing a later author', async () => {
  jest.mocked(fetchAPI).mockResolvedValue({
    posts: {
      edges: [{ node: node('post-1', 11) }, { node: node('post-2', 22) }]
    }
  })
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: false })
    .mockRejectedValueOnce(new Error('offline'))
  const authors = await getOpinionAuthors(2)
  expect(authors.map(author => author.latestPost.id)).toEqual([
    'post-1',
    'post-2'
  ])
  expect(authors.map(author => author.avatarUrl)).toEqual([
    'https://example.com/avatar-11.jpg',
    'https://example.com/avatar-22.jpg'
  ])
})

it('does not fetch photos for absent author configuration or empty editorial results', async () => {
  delete process.env.WORDPRESS_OPINION_API_URL
  global.fetch = jest.fn()
  jest
    .mocked(fetchAPI)
    .mockResolvedValue({ posts: { edges: [{ node: node('post-1', 11) }] } })
  expect((await getOpinionAuthors())[0].avatarUrl).toBe(
    'https://example.com/avatar-11.jpg'
  )
  jest.mocked(fetchAPI).mockResolvedValue(null)
  expect(await getOpinionAuthors()).toEqual([])
  expect(global.fetch).not.toHaveBeenCalled()
})
