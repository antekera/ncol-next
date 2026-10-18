import type { CategoriesClient } from '@lib/api/CategoriesClient'
import type { PostsClient } from '@lib/api/PostsClient'
import { getDescendantIds, selectFeaturedArticle } from './compose'
import { HOME_V2_SECTIONS } from './sections'
import {
  filterHomeHeadlineDates,
  homeEditorialDay,
  isOpeningEligible,
  OPENING_CATEGORY_SLUGS
} from './editorialPolicy'
import type {
  HomeCategory,
  HomeModuleRequest,
  HomeSectionConfig,
  HomeV2Data
} from './types'

interface HomeEditorialClients {
  categories: Pick<CategoriesClient, 'getHomeTaxonomyPage'>
  posts: Pick<PostsClient, 'getHomeModules'>
}

async function loadTaxonomies(
  client: HomeEditorialClients['categories']
): Promise<HomeCategory[] | null> {
  const categories: HomeCategory[] = []
  const cursors = new Set<string>()
  let after: string | null = null
  for (;;) {
    const page = await client.getHomeTaxonomyPage(after)
    if (!page) return null
    categories.push(...page.nodes)
    if (!page.pageInfo.hasNextPage) break
    const next = page.pageInfo.endCursor
    if (!next || cursors.has(next)) {
      return null
    }
    cursors.add(next)
    after = next
  }
  return categories
}

function prepareRequests(
  config: readonly HomeSectionConfig[],
  categories: readonly HomeCategory[],
  descendants: Map<string, number[]>
) {
  const bySlug = new Map(
    categories.map(category => [category.slug.toLowerCase(), category])
  )
  const requests: HomeModuleRequest[] = []
  const errors: string[] = []
  for (const section of config) {
    if (section.presentation === 'opening') {
      const categoryIds = [
        ...new Set(
          OPENING_CATEGORY_SLUGS.flatMap(slug => descendants.get(slug) ?? [])
        )
      ]
      requests.push({
        id: section.id,
        categoryIds,
        limit: 30,
        includeOpeningFields: true
      })
      requests.push({
        id: 'opening-featured',
        categoryIds: null,
        limit: 30,
        includeOpeningFields: true,
        featuredOnly: true
      })
      continue
    }
    if (section.source) {
      requests.push({
        id: section.id,
        categoryIds: null,
        limit: section.source === 'video' ? 12 : section.limit,
        ...(section.source === 'video' ? { videoOnly: true } : {})
      })
      continue
    }
    const category = bySlug.get(section.categorySlug.toLowerCase())
    if (!category) {
      errors.push(section.id)
      continue
    }
    requests.push({
      id: section.id,
      includeOpeningFields: false,
      categoryIds: section.includeDescendants
        ? (descendants.get(category.slug) ?? [])
        : [category.databaseId],
      // Allow replacements after excluding the featured/previously placed stories.
      limit: Math.min(section.limit + 4, 30)
    })
  }
  return { requests, errors }
}

// Keep orchestration independent of Next's cache and render lifecycle.
export async function loadHomeV2Data(
  clients: HomeEditorialClients,
  config: readonly HomeSectionConfig[] = HOME_V2_SECTIONS,
  editorialDay = homeEditorialDay()
): Promise<HomeV2Data> {
  const categories = await loadTaxonomies(clients.categories)
  if (!categories) {
    return { featured: null, sections: {}, regions: [], errors: ['taxonomies'] }
  }

  const descendants = getDescendantIds(categories)
  const { requests, errors } = prepareRequests(config, categories, descendants)
  const response = requests.length
    ? await clients.posts.getHomeModules(requests)
    : { modules: {}, hasErrors: false }
  const result = response.modules
  if (response.hasErrors) errors.push('modules')
  const sections: HomeV2Data['sections'] = {}
  for (const section of config) {
    sections[section.id] = result?.[section.id] ?? []
    if (
      requests.some(request => request.id === section.id) &&
      !result?.[section.id]
    )
      errors.push(section.id)
  }
  if (config.some(section => section.presentation === 'opening')) {
    if (!result?.['opening-featured']) errors.push('opening-featured')
    const allowedIds = new Set(
      OPENING_CATEGORY_SLUGS.flatMap(slug => descendants.get(slug) ?? [])
    )
    const allowedSlugs = new Set(
      categories
        .filter(category => allowedIds.has(category.databaseId))
        .map(category => category.slug)
    )
    sections.opening = [
      ...(sections.opening ?? []),
      ...(result?.['opening-featured'] ?? [])
    ]
      .filter(article => isOpeningEligible(article, allowedSlugs))
      .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
  }
  const regionalIds = new Set(descendants.get('zulia') ?? [])
  return filterHomeHeadlineDates(
    {
      featured: selectFeaturedArticle(sections.opening ?? []),
      sections,
      regions: categories.filter(category =>
        regionalIds.has(category.databaseId)
      ),
      errors
    },
    editorialDay
  )
}
