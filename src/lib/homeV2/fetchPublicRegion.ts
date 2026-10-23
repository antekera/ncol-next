import type { HomeArticle } from './types'
import { homeEditorialDay } from './editorialPolicy'

type PublicRegionResult =
  | {
      ok: true
      articles: HomeArticle[]
      editorialDay: string
      cacheUntil: number
    }
  | { ok: false; articles: [] }

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

function article(value: unknown): value is HomeArticle {
  return (
    record(value) &&
    typeof value.title === 'string' &&
    typeof value.uri === 'string' &&
    record(value.categories) &&
    Array.isArray(value.categories.edges) &&
    value.categories.edges.every(
      edge =>
        record(edge) &&
        record(edge.node) &&
        (edge.node.slug == null || typeof edge.node.slug === 'string') &&
        (edge.node.name == null || typeof edge.node.name === 'string')
    )
  )
}

/** Public news only: no reader cookies, tracking parameters or cache-bypass mode. */
export async function fetchPublicRegion(
  region: string
): Promise<PublicRegionResult> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const day = homeEditorialDay()
    const response = await fetch(
      `/api/home-v2/region/${day}/${encodeURIComponent(region)}`,
      { credentials: 'omit' }
    )
    const now = Date.now()
    if (!response.ok) {
      if (
        attempt === 0 &&
        response.status === 410 &&
        homeEditorialDay(new Date(now)) !== day
      )
        continue
      return { ok: false, articles: [] }
    }
    const value: unknown = await response.json()
    const receivedAt = Date.now()
    const currentDay = homeEditorialDay(new Date(receivedAt))
    if (attempt === 0 && currentDay !== day) continue
    if (
      !record(value) ||
      value.ok !== true ||
      value.editorialDay !== currentDay ||
      !Array.isArray(value.articles) ||
      !value.articles.every(article) ||
      typeof value.cacheUntil !== 'number' ||
      !Number.isFinite(value.cacheUntil) ||
      typeof value.validUntil !== 'number' ||
      !Number.isFinite(value.validUntil) ||
      receivedAt >= value.validUntil
    )
      return { ok: false, articles: [] }
    return {
      ok: true,
      articles: value.articles,
      editorialDay: currentDay,
      cacheUntil: Math.min(value.cacheUntil, value.validUntil)
    }
  }
  return { ok: false, articles: [] }
}
