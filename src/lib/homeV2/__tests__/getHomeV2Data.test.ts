import { getHomeV2Data } from '../getHomeV2Data'
import { unstable_cache } from 'next/cache'
import { categoriesClient, postsClient } from '@lib/api'

jest.mock('@lib/api', () => ({
  categoriesClient: { getHomeTaxonomyPage: jest.fn() },
  postsClient: { getHomeModules: jest.fn() }
}))
// Next's persistent cache requires its request runtime. This double only stores
// successfully resolved values, so the test exercises our failure-cache policy.
jest.mock('next/cache', () => ({
  unstable_cache: jest.fn((load: () => Promise<unknown>) => {
    let saved: unknown
    return async () => {
      if (saved === undefined) saved = await load()
      return saved
    }
  })
}))
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  cache: (load: () => Promise<unknown>) => load
}))

it('renders partial data without persisting a failed CMS response', async () => {
  jest.spyOn(categoriesClient, 'getHomeTaxonomyPage').mockResolvedValue({
    nodes: [
      '_pos_columna_izq',
      'zulia',
      'nacionales',
      'sucesos',
      'internacionales',
      'deportes',
      'tendencias',
      'entretenimiento'
    ].map((slug, index) => ({
      id: `c${index}`,
      databaseId: index + 1,
      slug,
      name: slug,
      parentId: null
    })),
    pageInfo: { hasNextPage: false, endCursor: null }
  })
  const story = {
    id: 'p1',
    uri: '/nacionales/10/17/nota/',
    title: 'Noticia recuperada',
    categories: { edges: [] }
  }
  const recovered = {
    videos: [],
    latest: [],
    opening: [story],
    zulia: [],
    nacionales: [],
    sucesos: [],
    internacionales: [],
    deportes: [],
    tendencias: [],
    entretenimiento: []
  }
  const modules = jest
    .spyOn(postsClient, 'getHomeModules')
    .mockResolvedValueOnce({ modules: null, hasErrors: true })
    .mockResolvedValue({ modules: recovered, hasErrors: false })
  const outage = await getHomeV2Data()
  expect(outage.featured).toBeNull()
  expect(outage.errors).toContain('opening')
  const healthy = await getHomeV2Data()
  expect(healthy.featured?.id).toBe('p1')
  expect(healthy.errors).toEqual([])
  await getHomeV2Data()
  expect(modules).toHaveBeenCalledTimes(2)
})

it('configures a revalidation window of at most five minutes while retaining publication invalidation tags', () => {
  const options = jest.mocked(unstable_cache).mock.calls[0][2]
  expect(options?.revalidate).toEqual(expect.any(Number))
  expect(options?.revalidate).toBeLessThanOrEqual(5 * 60)
  expect(options?.tags).toEqual(
    expect.arrayContaining(['homepage', 'featured-post', 'category-sucesos'])
  )
})
