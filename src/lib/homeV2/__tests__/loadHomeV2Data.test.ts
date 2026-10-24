import { loadHomeV2Data } from '../loadHomeV2Data'
import type { HomeArticle, HomeCategory, HomeSectionConfig } from '../types'

beforeEach(() =>
  jest.useFakeTimers().setSystemTime(new Date('2026-10-18T15:00:00Z'))
)
afterEach(() => jest.useRealTimers())

const config: readonly HomeSectionConfig[] = [
  {
    id: 'opening',
    title: 'Apertura',
    categorySlug: '_pos_columna_izq',
    position: 1,
    presentation: 'opening',
    limit: 3,
    href: '/',
    includeDescendants: false
  },
  {
    id: 'zulia',
    title: 'Todo Zulia',
    categorySlug: 'zulia',
    position: 2,
    presentation: 'regional',
    limit: 6,
    href: '/categoria/zulia/',
    includeDescendants: true
  },
  {
    id: 'missing',
    title: 'Sin datos',
    categorySlug: 'missing',
    position: 3,
    presentation: 'lead_list',
    limit: 6,
    href: '/categoria/missing/',
    includeDescendants: false
  }
]
const taxonomy: HomeCategory[] = [
  {
    id: 'c55',
    databaseId: 55,
    name: 'Izquierda',
    slug: '_pos_columna_izq',
    parentId: null
  },
  { id: 'c52', databaseId: 52, name: 'Zulia', slug: 'zulia', parentId: null },
  {
    id: 'c10',
    databaseId: 10,
    name: 'COL',
    slug: 'costa-oriental',
    parentId: 'c52'
  },
  {
    id: 'c11',
    databaseId: 11,
    name: 'Cabimas',
    slug: 'cabimas',
    parentId: 'c10'
  }
]
const story: HomeArticle = {
  id: 'p1',
  uri: '/nacionales/10/17/nota/',
  title: 'Noticia editorial',
  date: '2026-10-18T09:00:00',
  categories: { edges: [] },
  customFields: { noticiadestacada: true }
}

it('loads taxonomy once and batches sections with descendant category ids', async () => {
  const getHomeTaxonomyPage = jest.fn().mockResolvedValue({
    nodes: taxonomy,
    pageInfo: { hasNextPage: false, endCursor: null }
  })
  const getHomeModules = jest.fn().mockResolvedValue({
    modules: { opening: [story], 'opening-featured': [], zulia: [] },
    hasErrors: false
  })
  const data = await loadHomeV2Data(
    { categories: { getHomeTaxonomyPage }, posts: { getHomeModules } },
    config
  )
  expect(getHomeTaxonomyPage).toHaveBeenCalledTimes(1)
  expect(getHomeModules).toHaveBeenCalledTimes(1)
  expect(getHomeModules).toHaveBeenCalledWith([
    {
      id: 'opening',
      categoryIds: [52, 10, 11],
      limit: 30,
      includeOpeningFields: true
    },
    {
      id: 'opening-featured',
      categoryIds: null,
      limit: 30,
      includeOpeningFields: true,
      featuredOnly: true
    },
    {
      id: 'zulia',
      categoryIds: [52, 10, 11],
      limit: 10,
      includeOpeningFields: false
    }
  ])
  expect(data.featured).toEqual(story)
  expect(data.regions.map(x => x.slug)).toEqual([
    'zulia',
    'costa-oriental',
    'cabimas'
  ])
  expect(data.sections).toEqual({ opening: [story], zulia: [], missing: [] })
  expect(data.errors).toEqual(['missing'])
})

it('follows taxonomy cursors instead of silently dropping descendants after page 100', async () => {
  const getHomeTaxonomyPage = jest
    .fn()
    .mockResolvedValueOnce({
      nodes: taxonomy.slice(0, 2),
      pageInfo: { hasNextPage: true, endCursor: 'next' }
    })
    .mockResolvedValueOnce({
      nodes: taxonomy.slice(2),
      pageInfo: { hasNextPage: false, endCursor: null }
    })
  const getHomeModules = jest.fn().mockResolvedValue({
    modules: { opening: [story], 'opening-featured': [], zulia: [] },
    hasErrors: false
  })
  await loadHomeV2Data(
    { categories: { getHomeTaxonomyPage }, posts: { getHomeModules } },
    config
  )
  expect(getHomeTaxonomyPage.mock.calls).toEqual([[null], ['next']])
  expect(getHomeModules.mock.calls[0][0][2].categoryIds).toEqual([52, 10, 11])
})

it('keeps successful news when a sibling module fails', async () => {
  const data = await loadHomeV2Data(
    {
      categories: {
        getHomeTaxonomyPage: async () => ({
          nodes: taxonomy,
          pageInfo: { hasNextPage: false, endCursor: null }
        })
      },
      posts: {
        getHomeModules: async () => ({
          modules: { opening: [story], 'opening-featured': [], zulia: null },
          hasErrors: false
        })
      }
    },
    config.slice(0, 2)
  )
  expect(data.featured).toEqual(story)
  expect(data.errors).toEqual(['zulia'])
  expect(data.sections.zulia).toEqual([])
})

it('does not spin or request posts from an incomplete repeated-cursor taxonomy', async () => {
  const getHomeTaxonomyPage = jest.fn().mockResolvedValue({
    nodes: taxonomy,
    pageInfo: { hasNextPage: true, endCursor: 'same' }
  })
  const getHomeModules = jest.fn()
  const data = await loadHomeV2Data(
    { categories: { getHomeTaxonomyPage }, posts: { getHomeModules } },
    config
  )
  expect(getHomeTaxonomyPage).toHaveBeenCalledTimes(2)
  expect(getHomeModules).not.toHaveBeenCalled()
  expect(data.errors).toEqual(['taxonomies'])
})

it('filters expired title dates while preserving older ordinary news and keeps only eligible opening categories or explicit flags', async () => {
  const dated = (
    id: string,
    slug: string,
    date = '2026-10-18T09:00:00',
    featured = false
  ): HomeArticle => ({
    id,
    uri: `/${id}/`,
    title: id,
    date,
    categories: { edges: [{ node: { slug, name: slug } }] },
    customFields: { noticiadestacada: featured }
  })
  const allowed = dated('allowed', 'cabimas')
  const marked = dated('marked', 'deportes', undefined, true)
  const weather = {
    ...dated('weather', 'zulia', undefined, true),
    title: 'I-N-A-M-E-H pronostica lluvias'
  }
  const dollar = { ...dated('dollar', 'zulia'), title: 'Precio del dólar hoy' }
  const yesterday = dated('yesterday', 'zulia', '2026-10-17T23:59:59')
  const expired = {
    ...dated('expired', 'zulia', undefined, true),
    title: 'Jornada del 17 de octubre'
  }
  const other = dated('other', 'deportes')
  jest.useFakeTimers().setSystemTime(new Date('2026-10-18T15:00:00Z'))
  try {
    const data = await loadHomeV2Data(
      {
        categories: {
          getHomeTaxonomyPage: async () => ({
            nodes: taxonomy,
            pageInfo: { hasNextPage: false, endCursor: null }
          })
        },
        posts: {
          getHomeModules: async () => ({
            modules: {
              opening: [other, weather, dollar, expired, yesterday, allowed],
              'opening-featured': [marked],
              zulia: [expired, yesterday, allowed]
            },
            hasErrors: false
          })
        }
      },
      config.slice(0, 2)
    )
    expect(data.sections.opening.map(post => post.id)).toEqual([
      'allowed',
      'marked',
      'yesterday'
    ])
    expect(data.featured?.id).toBe('marked')
    expect(data.sections.zulia).toEqual([yesterday, allowed])
  } finally {
    jest.useRealTimers()
  }
})
