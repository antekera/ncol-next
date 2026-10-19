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
  unstable_cache: jest.fn((load: (...args: unknown[]) => Promise<unknown>) => {
    const saved = new Map<string, unknown>()
    return async (...args: unknown[]) => {
      const key = JSON.stringify(args)
      if (!saved.has(key)) saved.set(key, await load(...args))
      return saved.get(key)
    }
  })
}))
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  cache: (load: (...args: unknown[]) => Promise<unknown>) => load
}))

beforeEach(() =>
  jest.useFakeTimers().setSystemTime(new Date('2026-10-18T15:00:00Z'))
)
afterEach(() => jest.useRealTimers())

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
    date: '2026-10-18T10:30:00',
    customFields: { noticiadestacada: true },
    categories: { edges: [{ node: { slug: 'deportes', name: 'Deportes' } }] }
  }
  const recovered = {
    videos: [],
    latest: [],
    opening: [
      story,
      {
        ...story,
        id: 'ordinary',
        date: '2026-10-10T08:00:00',
        categories: { edges: [{ node: { slug: 'zulia', name: 'Zulia' } }] },
        customFields: { noticiadestacada: false }
      },
      {
        ...story,
        id: 'dated',
        title: 'Jornada del 18 de octubre de 2026',
        categories: { edges: [{ node: { slug: 'zulia', name: 'Zulia' } }] },
        customFields: { noticiadestacada: false }
      }
    ],
    'opening-featured': [],
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
  expect(
    jest.spyOn(categoriesClient, 'getHomeTaxonomyPage')
  ).toHaveBeenCalledTimes(1)
})

it('configures a revalidation window of at most five minutes while retaining publication invalidation tags', () => {
  const options = jest
    .mocked(unstable_cache)
    .mock.calls.find(([, keys]) => keys?.includes('home-v2-editorial-v8'))?.[2]
  expect(options?.revalidate).toEqual(expect.any(Number))
  expect(options?.revalidate).toBeLessThanOrEqual(5 * 60)
  expect(options?.tags).toEqual(
    expect.arrayContaining(['homepage', 'featured-post', 'category-sucesos'])
  )
})

it('rechecks headline validity at midnight while retaining older ordinary news from the CMS', async () => {
  jest.setSystemTime(new Date('2026-10-19T04:00:00Z'))
  const data = await getHomeV2Data()
  expect(data.featured?.id).toBe('p1')
  expect(data.sections.opening.map(post => post.id)).toEqual(['p1', 'ordinary'])
  expect(jest.spyOn(postsClient, 'getHomeModules')).toHaveBeenCalledTimes(3)
})

it('expires a manual category override from the same cached CMS snapshot without another query', async () => {
  jest.setSystemTime(new Date('2026-10-19T14:30:00Z'))
  const data = await getHomeV2Data()
  expect(data.featured?.id).toBe('ordinary')
  expect(data.sections.opening.map(post => post.id)).toEqual(['ordinary'])
  expect(jest.spyOn(postsClient, 'getHomeModules')).toHaveBeenCalledTimes(3)
})
