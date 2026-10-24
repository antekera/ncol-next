import {
  filterHomeHeadlineDates,
  headlineExpiresAt,
  homeEditorialDay
} from './editorialPolicy'
import { composeHomeSections, featuredArticleExpiresAt } from './compose'
import { HOME_V2_SECTIONS } from './sections'
import type { HomeArticle, HomeSection, HomeV2Data } from './types'

export interface HomeEditorialEdition {
  at: number
  data: HomeV2Data
  sections: HomeSection[]
}

/** Known eligibility changes need no CMS request. Never resurrect an expired
 * yearless headline from an old snapshot when the calendar rolls forward. */
export function getHomeEditorialEditions(
  source: HomeV2Data,
  now = Date.now()
): HomeEditorialEdition[] {
  const day = homeEditorialDay(new Date(now))
  const articles = new Set(Object.values(source.sections).flat())
  if (source.featured) articles.add(source.featured)
  const expiries = new Map<HomeArticle, number>()
  const changes = new Set<number>([now])
  for (const article of articles) {
    const titleExpiry = headlineExpiresAt(article, day)
    if (titleExpiry !== null) {
      expiries.set(article, titleExpiry)
      if (titleExpiry > now) changes.add(titleExpiry)
    }
    const manualExpiry = featuredArticleExpiresAt(article)
    if (manualExpiry !== null) {
      if (manualExpiry > now) changes.add(manualExpiry)
      const publishedAt = manualExpiry - 86400000
      if (publishedAt > now) changes.add(publishedAt)
    }
  }
  return [...changes]
    .sort((a, b) => a - b)
    .map(at => {
      const eligible = (article: HomeArticle) =>
        at < (expiries.get(article) ?? Infinity)
      const data = filterHomeHeadlineDates(
        {
          ...source,
          featured:
            source.featured && eligible(source.featured)
              ? source.featured
              : null,
          sections: Object.fromEntries(
            Object.entries(source.sections).map(([id, posts]) => [
              id,
              posts.filter(eligible)
            ])
          )
        },
        homeEditorialDay(new Date(at)),
        at
      )
      return { at, data, sections: composeHomeSections(data, HOME_V2_SECTIONS) }
    })
}

export const sameEditorialArticles = (
  left: readonly HomeArticle[],
  right: readonly HomeArticle[]
) =>
  left.length === right.length &&
  left.every((post, index) => post === right[index])
