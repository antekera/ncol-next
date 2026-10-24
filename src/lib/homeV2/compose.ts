import type {
  HomeArticle,
  HomeCategory,
  HomeSection,
  HomeSectionConfig,
  HomeV2Data,
  OpeningTreatment
} from './types'
import { canonicalPath } from '@lib/siteUrl'
import { WIDE_IMAGE_THRESHOLD } from '@lib/constants'

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
      const placed = section.allowRepeatedArticles ? new Set<string>() : seen
      for (const article of data.sections[section.id] ?? []) {
        if (articles.length >= section.limit) break
        const keys = articleKeys(article)
        if (keys.some(key => placed.has(key))) continue
        keys.forEach(key => placed.add(key))
        articles.push(article)
      }
      return { ...section, articles }
    })
}

export function featuredArticleExpiresAt(article: HomeArticle): number | null {
  if (
    article.customFields?.noticiadestacada !== true ||
    !article.date?.includes('T') ||
    article.date.length < 19
  )
    return null
  const calendarDay = Date.parse(`${article.date.slice(0, 10)}T12:00:00Z`)
  if (
    !Number.isFinite(calendarDay) ||
    new Date(calendarDay).toISOString().slice(0, 10) !==
      article.date.slice(0, 10)
  )
    return null
  // WPGraphQL dates without an offset use the editorial timezone (Caracas).
  const source = /(?:Z|[+-]\d{2}:\d{2})$/.test(article.date)
    ? article.date
    : `${article.date}-04:00`
  const timestamp = Date.parse(source)
  return Number.isFinite(timestamp) ? timestamp + 86400000 : null
}

export function isFeaturedArticle(article: HomeArticle, now = Date.now()) {
  const expiresAt = featuredArticleExpiresAt(article)
  return expiresAt !== null && now >= expiresAt - 86400000 && now < expiresAt
}

export function selectFeaturedArticle(
  articles: readonly HomeArticle[],
  now = Date.now()
): HomeArticle | null {
  return (
    articles.find(article => isFeaturedArticle(article, now)) ??
    articles[0] ??
    null
  )
}

export function selectOpeningTreatment(
  featured: HomeArticle | null
): OpeningTreatment {
  const source = featured?.featuredImage?.node?.sourceUrl
  const dimensions = featured?.featuredImage?.node?.mediaDetails
  if (
    source &&
    Number.isFinite(dimensions?.width) &&
    Number.isFinite(dimensions?.height) &&
    (dimensions?.width ?? 0) >= WIDE_IMAGE_THRESHOLD &&
    (dimensions?.height ?? 0) >= 600
  ) {
    try {
      const url = new URL(source)
      if (url.protocol === 'https:' && !url.username && !url.password)
        return 'photographic'
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
