import { cleanText } from '@lib/utils/cleanText'
import { selectFeaturedArticle } from './compose'
import type { HomeArticle, HomeV2Data } from './types'

export const OPENING_CATEGORY_SLUGS = ['sucesos', 'nacionales', 'zulia']

export function homePublicationDay(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Caracas',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now)
}

export function isPublicationDay(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(`${value}T12:00:00Z`)) &&
    new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value
  )
}

export function isPublishedOnDay(
  article: { date?: string },
  day: string
): boolean {
  const value = article.date
  if (!value || !isPublicationDay(value.slice(0, 10))) return false
  if (value.length === 10) return value === day
  if (
    // eslint-disable-next-line security/detect-unsafe-regex -- ISO fields and fraction repetitions are bounded.
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})?$/.test(
      value
    )
  )
    return false
  if (
    Number(value.slice(11, 13)) > 23 ||
    Number(value.slice(14, 16)) > 59 ||
    Number(value.slice(17, 19)) > 59
  )
    return false
  const source = /(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}-04:00`
  const date = new Date(source)
  return Number.isFinite(date.getTime()) && homePublicationDay(date) === day
}

export function isOpeningEligible(
  article: HomeArticle,
  allowedSlugs: ReadonlySet<string>
): boolean {
  const title = cleanText(article.title)
    .replace(/&oacute;/gi, 'ó')
    .replace(/&#(?:243|x0*f3);/gi, 'ó')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  if (
    /\bdolar\b|\bi[\s\p{Pd}]*n[\s\p{Pd}]*a[\s\p{Pd}]*m[\s\p{Pd}]*e[\s\p{Pd}]*h\b/u.test(
      title
    )
  )
    return false
  return (
    article.customFields?.noticiadestacada === true ||
    article.categories.edges.some(
      ({ node }) => !!node.slug && allowedSlugs.has(node.slug)
    )
  )
}

// Recheck after persistent cache reads too: an expired snapshot cannot carry
// yesterday's articles into today's response, including a CMS error fallback.
export function filterHomePublicationDay(
  data: HomeV2Data,
  day: string
): HomeV2Data {
  const sections = Object.fromEntries(
    Object.entries(data.sections).map(([id, articles]) => [
      id,
      articles.filter(article => isPublishedOnDay(article, day))
    ])
  )
  return {
    ...data,
    sections,
    featured:
      data.featured && isPublishedOnDay(data.featured, day)
        ? data.featured
        : selectFeaturedArticle(sections.opening ?? [])
  }
}

// The ranking API stores visit dates, not publication dates. Only its canonical
// dated article path can identify the publication day; never use created_at.
export function rankingPublicationDay(slug: string): string | null {
  try {
    const path = new URL(slug, 'https://www.noticiascol.com').pathname
    const match = /^\/(\d{4})\/(\d{2})\/(\d{2})\/[^/]+\/?$/.exec(path)
    const day = match ? `${match[1]}-${match[2]}-${match[3]}` : ''
    return isPublicationDay(day) ? day : null
  } catch {
    return null
  }
}
