import type {
  HomeArticle,
  HomeCategory,
  HomeSection,
  HomeSectionConfig,
  HomeV2Data,
  OpeningTreatment
} from './types'
import { canonicalPath } from '@lib/siteUrl'

const articleKeys = (article: HomeArticle): string[] => [
  ...(article.id ? [`id:${article.id}`] : []),
  `uri:${canonicalPath(article.uri)}`
]

export function composeHomeSections(
  data: HomeV2Data,
  config: readonly HomeSectionConfig[]
): HomeSection[] {
  const ids = new Set<string>()
  const positions = new Set<number>()
  for (const section of config) {
    if (!section.id || ids.has(section.id))
      throw new Error('Duplicate module id')
    if (
      !Number.isInteger(section.position) ||
      section.position < 1 ||
      positions.has(section.position)
    ) {
      throw new Error('Invalid editorial position')
    }
    if (
      !Number.isInteger(section.limit) ||
      section.limit < 1 ||
      section.limit > 30
    ) {
      throw new Error('Invalid section limit')
    }
    ids.add(section.id)
    positions.add(section.position)
  }

  const seen = new Set(data.featured ? articleKeys(data.featured) : [])
  return [...config]
    .sort((a, b) => a.position - b.position)
    .map(section => {
      const articles: HomeArticle[] = []
      for (const article of data.sections[section.id] ?? []) {
        if (articles.length >= section.limit) break
        const keys = articleKeys(article)
        if (keys.some(key => seen.has(key))) continue
        keys.forEach(key => seen.add(key))
        articles.push(article)
      }
      return { ...section, articles }
    })
}

export function selectFeaturedArticle(
  articles: readonly HomeArticle[]
): HomeArticle | null {
  return (
    articles.find(article => article.customFields?.noticiadestacada === true) ??
    articles[0] ??
    null
  )
}

export function selectOpeningTreatment(
  featured: HomeArticle | null
): OpeningTreatment {
  const source = featured?.featuredImage?.node?.sourceUrl
  if (source) {
    try {
      if (new URL(source).protocol === 'https:') return 'photographic'
    } catch {
      // Missing or malformed CMS images use the traditional opening.
    }
  }
  return 'traditional'
}

export function getDescendantIds(
  categories: readonly HomeCategory[]
): Map<string, number[]> {
  const children = new Map<string, HomeCategory[]>()
  for (const category of categories) {
    if (!category.parentId) continue
    const siblings = children.get(category.parentId) ?? []
    siblings.push(category)
    children.set(category.parentId, siblings)
  }
  return new Map(
    categories.map(category => {
      const visited = new Set<string>()
      const ids: number[] = []
      const pending = [category]
      for (let index = 0; index < pending.length; index++) {
        const node = pending[index]
        if (visited.has(node.id)) continue
        visited.add(node.id)
        ids.push(node.databaseId)
        pending.push(...(children.get(node.id) ?? []))
      }
      return [category.slug, ids]
    })
  )
}
