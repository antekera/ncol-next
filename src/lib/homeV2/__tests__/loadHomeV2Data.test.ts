import { loadHomeV2Data } from '../loadHomeV2Data'
import type { HomeArticle, HomeCategory, HomeSectionConfig } from '../types'

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
  categories: { edges: [] },
  customFields: { noticiadestacada: true }
}

it('loads taxonomy once and batches sections with descendant category ids', async () => {
  const getHomeTaxonomyPage = jest.fn().mockResolvedValue({
    nodes: taxonomy,
    pageInfo: { hasNextPage: false, endCursor: null }
  })
  const getHomeModules = jest
    .fn()
    .mockResolvedValue({ opening: [story], zulia: [] })
  const data = await loadHomeV2Data(
    { categories: { getHomeTaxonomyPage }, posts: { getHomeModules } },
    config
  )
  expect(getHomeTaxonomyPage).toHaveBeenCalledTimes(1)
  expect(getHomeModules).toHaveBeenCalledTimes(1)
  expect(getHomeModules).toHaveBeenCalledWith([
    { id: 'opening', categoryIds: [55], limit: 10, includeOpeningFields: true },
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
  const getHomeModules = jest
    .fn()
    .mockResolvedValue({ opening: [story], zulia: [] })
  await loadHomeV2Data(
    { categories: { getHomeTaxonomyPage }, posts: { getHomeModules } },
    config
  )
  expect(getHomeTaxonomyPage.mock.calls).toEqual([[null], ['next']])
  expect(getHomeModules.mock.calls[0][0][1].categoryIds).toEqual([52, 10, 11])
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
      posts: { getHomeModules: async () => ({ opening: [story], zulia: null }) }
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
