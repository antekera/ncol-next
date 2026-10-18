import { PostsClient } from '../PostsClient'
import { CategoriesClient } from '../CategoriesClient'
import { HttpClient } from '@lib/httpClient'
import { BaseClient } from '../BaseClient'
import { loadHomeV2Data } from '@lib/homeV2/loadHomeV2Data'

jest.mock('@logtail/next', () => ({
  log: { error: jest.fn(), info: jest.fn() }
}))
jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn() }))

const endpoint = 'https://cms.example.test/graphql'
const post = {
  id: 'p1',
  title: 'Noticia de prueba',
  uri: '/nacionales/10/17/prueba/',
  categories: { edges: [] }
}
const fetchMock = jest.fn()
const jsonResponse = (data: unknown) => ({
  ok: true,
  status: 200,
  text: async () => JSON.stringify({ data })
})

it('preserves usable news but marks partial GraphQL data as incomplete for caching', async () => {
  fetchMock.mockResolvedValue({
    ok: true,
    status: 200,
    text: async () =>
      JSON.stringify({
        data: { m0: { nodes: [post] } },
        errors: [
          {
            message: 'Image resolver unavailable',
            path: ['m0', 'nodes', 0, 'featuredImage']
          }
        ]
      })
  })
  const data = await loadHomeV2Data(
    {
      categories: {
        getHomeTaxonomyPage: async () => ({
          nodes: [
            {
              id: 'c1',
              databaseId: 1,
              name: 'Opening',
              slug: '_pos_columna_izq',
              parentId: null
            }
          ],
          pageInfo: { hasNextPage: false, endCursor: null }
        })
      },
      posts: new PostsClient(new HttpClient(), endpoint)
    },
    [
      {
        id: 'opening',
        title: 'Opening',
        categorySlug: '_pos_columna_izq',
        position: 1,
        presentation: 'opening',
        limit: 3,
        href: '/',
        includeDescendants: false
      }
    ]
  )
  expect(data.featured).toEqual(post)
  expect(data.errors).toContain('modules')
})

it('rejects a partial taxonomy even when its connection is present', async () => {
  fetchMock.mockResolvedValue({
    ok: true,
    status: 200,
    text: async () =>
      JSON.stringify({
        data: {
          categories: {
            nodes: [],
            pageInfo: { hasNextPage: false, endCursor: null }
          }
        },
        errors: [{ message: 'Taxonomy resolver unavailable' }]
      })
  })
  await expect(
    new CategoriesClient(new HttpClient(), endpoint).getHomeTaxonomyPage()
  ).resolves.toBeNull()
})

it('keeps the established partial-data behavior of other API consumers', async () => {
  class ExistingClient extends BaseClient {
    read() {
      return this.post<{ title: string }>({ query: 'query Existing { title }' })
    }
  }
  fetchMock.mockResolvedValue({
    ok: true,
    status: 200,
    text: async () =>
      JSON.stringify({
        data: { title: 'Usable headline' },
        errors: [{ message: 'Sibling unavailable' }]
      })
  })
  await expect(
    new ExistingClient(new HttpClient(), endpoint).read()
  ).resolves.toEqual({ title: 'Usable headline' })
})

beforeEach(() => {
  fetchMock.mockReset()
  global.fetch = fetchMock
})

afterAll(() => {
  delete (global as Partial<typeof globalThis>).fetch
})

it('fetches multiple editorial modules in one GraphQL POST with public fields only', async () => {
  fetchMock.mockResolvedValue(
    jsonResponse({ m0: { nodes: [post] }, m1: { nodes: [] } })
  )
  const client = new PostsClient(new HttpClient(), endpoint)
  await expect(
    client.getHomeModules([
      { id: 'zulia', categoryIds: [52, 65], limit: 6 },
      { id: 'nacionales', categoryIds: [43], limit: 5 }
    ])
  ).resolves.toEqual({
    modules: { zulia: [post], nacionales: [] },
    hasErrors: false
  })
  expect(fetchMock).toHaveBeenCalledTimes(1)
  const [url, options] = fetchMock.mock.calls[0]
  const { query, variables } = JSON.parse(options.body)
  expect(url).toBe(endpoint)
  expect(options.method).toBe('POST')
  expect(options.next).toEqual({ revalidate: 0 })
  expect(query).toMatch(/m0:\s*posts/)
  expect(query).toMatch(/m1:\s*posts/)
  expect(query).not.toMatch(/\bcontent\b|\bemail\b|\busers\b/)
  expect(variables).toEqual({
    categories0: [52, 65],
    limit0: 6,
    categories1: [43],
    limit1: 5
  })
})

it('preserves a successful module when WordPress returns a null sibling', async () => {
  fetchMock.mockResolvedValue(jsonResponse({ m0: null, m1: { nodes: [post] } }))
  const client = new PostsClient(new HttpClient(), endpoint)
  await expect(
    client.getHomeModules([
      { id: 'zulia', categoryIds: [52], limit: 6 },
      { id: 'nacionales', categoryIds: [43], limit: 6 }
    ])
  ).resolves.toEqual({
    modules: { zulia: null, nacionales: [post] },
    hasErrors: false
  })
})

it('requests extracts and featured flags only for the opening, and embed URLs only for videos', async () => {
  fetchMock.mockResolvedValue(
    jsonResponse({
      m0: { nodes: [post] },
      m1: { nodes: [post] },
      m2: { nodes: [post] }
    })
  )
  const client = new PostsClient(new HttpClient(), endpoint)
  await client.getHomeModules([
    { id: 'opening', categoryIds: [55], limit: 10, includeOpeningFields: true },
    { id: 'zulia', categoryIds: [52], limit: 10 },
    { id: 'videos', categoryIds: null, limit: 12, videoOnly: true }
  ])
  expect(fetchMock).toHaveBeenCalledTimes(1)
  const { query } = JSON.parse(fetchMock.mock.calls[0][1].body)
  const [opening, regional, videos] = query.split(/m\d+: posts/).slice(1)
  expect(opening).toMatch(/\bexcerpt\b/)
  expect(opening).toContain('noticiadestacada')
  expect(opening).not.toContain('videodestacado')
  expect(regional).not.toMatch(
    /excerpt|noticiadestacada|videodestacado|parentId|customFields/
  )
  expect(videos).toContain('videodestacado')
  expect(videos).not.toMatch(/excerpt|noticiadestacada|parentId/)
})

it('does not query missing categories or accept unbounded module sizes', async () => {
  const client = new PostsClient(new HttpClient(), endpoint)
  await expect(client.getHomeModules([])).resolves.toEqual({
    modules: {},
    hasErrors: false
  })
  await expect(
    client.getHomeModules([{ id: 'empty', categoryIds: [], limit: 6 }])
  ).resolves.toEqual({ modules: { empty: [] }, hasErrors: false })
  await expect(
    client.getHomeModules([{ id: 'large', categoryIds: [52], limit: 10000 }])
  ).rejects.toThrow('limit')
  expect(fetchMock).not.toHaveBeenCalled()
})

it('loads a paginated taxonomy page, including public parent identifiers', async () => {
  const categories = {
    nodes: [
      { id: 'c1', databaseId: 52, parentId: null, slug: 'zulia', name: 'Zulia' }
    ],
    pageInfo: { hasNextPage: true, endCursor: 'next' }
  }
  fetchMock.mockResolvedValue(jsonResponse({ categories }))
  const client = new CategoriesClient(new HttpClient(), endpoint)
  await expect(client.getHomeTaxonomyPage('previous')).resolves.toEqual(
    categories
  )
  expect(fetchMock).toHaveBeenCalledTimes(1)
  const { query, variables } = JSON.parse(fetchMock.mock.calls[0][1].body)
  expect(fetchMock.mock.calls[0][1].next).toEqual({ revalidate: 0 })
  expect(query).toMatch(/parentId/)
  expect(query).toMatch(/hasNextPage/)
  expect(variables).toEqual({ after: 'previous' })
})

it('batches latest news and video selections without imposing a category filter', async () => {
  fetchMock.mockResolvedValue(
    jsonResponse({ m0: { nodes: [post] }, m1: { nodes: [post] } })
  )
  const client = new PostsClient(new HttpClient(), endpoint)
  await expect(
    client.getHomeModules([
      { id: 'latest', categoryIds: null, limit: 8 },
      { id: 'videos', categoryIds: null, limit: 12, videoOnly: true }
    ])
  ).resolves.toEqual({
    modules: { latest: [post], videos: [post] },
    hasErrors: false
  })
  const { query, variables } = JSON.parse(fetchMock.mock.calls[0][1].body)
  expect(query).toContain('metaQuery')
  expect(query).toContain('videodestacado')
  expect(query).not.toContain('categoryIn:')
  expect(variables).toEqual({ limit0: 8, limit1: 12 })
  expect(fetchMock).toHaveBeenCalledTimes(1)
})
