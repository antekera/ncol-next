import type { CategoriesClient } from '@lib/api/CategoriesClient'
import type { PostsClient } from '@lib/api/PostsClient'
import { getDescendantIds, selectFeaturedArticle } from './compose'
import { HOME_V2_SECTIONS } from './sections'
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
      includeOpeningFields: section.presentation === 'opening',
      categoryIds: section.includeDescendants
        ? (descendants.get(category.slug) ?? [])
        : [category.databaseId],
      // Allow replacements after excluding the featured/previously placed stories.
      limit: section.id === 'opening' ? 10 : Math.min(section.limit + 4, 30)
    })
  }
  return { requests, errors }
}

// Keep orchestration independent of Next's cache and render lifecycle.
export async function loadHomeV2Data(
  clients: HomeEditorialClients,
  config: readonly HomeSectionConfig[] = HOME_V2_SECTIONS
): Promise<HomeV2Data> {
  const categories = await loadTaxonomies(clients.categories)
  if (!categories) {
    return { featured: null, sections: {}, regions: [], errors: ['taxonomies'] }
  }

  const descendants = getDescendantIds(categories)
  const { requests, errors } = prepareRequests(config, categories, descendants)
  const result = requests.length
    ? await clients.posts.getHomeModules(requests)
    : {}
  const sections: HomeV2Data['sections'] = {}
  for (const section of config) {
    sections[section.id] = result?.[section.id] ?? []
    if (
      requests.some(request => request.id === section.id) &&
      !result?.[section.id]
    )
      errors.push(section.id)
  }
  const regionalIds = new Set(descendants.get('zulia') ?? [])
  return {
    featured: selectFeaturedArticle(sections.opening ?? []),
    sections,
    regions: categories.filter(category =>
      regionalIds.has(category.databaseId)
    ),
    errors
  }
}
