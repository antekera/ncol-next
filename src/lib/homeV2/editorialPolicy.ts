import { cleanText } from '@lib/utils/cleanText'
import { selectFeaturedArticle } from './compose'
import type { HomeArticle, HomeV2Data } from './types'

export const OPENING_CATEGORY_SLUGS = ['sucesos', 'nacionales', 'zulia']

export function homeEditorialDay(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Caracas',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now)
}

const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre'
]

interface DatedHeadline {
  title?: string | null
  date?: string
  uri?: string
  slug?: string
}

function calendarDate(year: number, month: number, day: number): string | null {
  if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31)
    return null
  const value = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const timestamp = Date.parse(`${value}T12:00:00Z`)
  return Number.isFinite(timestamp) &&
    new Date(timestamp).toISOString().slice(0, 10) === value
    ? value
    : null
}

function inferredDate(
  month: number,
  day: number,
  today: string
): string | null {
  let year = Number(today.slice(0, 4))
  const currentMonth = Number(today.slice(5, 7))
  // Resolve yearless dates from the editorial calendar, never publication age.
  if (currentMonth === 1 && month === 12) year--
  if (currentMonth === 12 && month === 1) year++
  return calendarDate(year, month, day)
}

function abbreviatedRangeEnd(start: string, suffix: string): string | null {
  const range = /^ (?:al|a|hasta el|hasta|y el|y) (\d{1,2})\b/.exec(suffix)
  if (!range) return null
  const remainder = suffix.slice(range[0].length)
  const writtenMonth = /^ (?:de )?([a-z]{4,10})\b/.exec(remainder)?.[1]
  // A complete second date is parsed independently, with its own month/year.
  if (
    writtenMonth &&
    (MONTHS.includes(writtenMonth) || writtenMonth === 'setiembre')
  )
    return null
  const [year, month, day] = start.split('-').map(Number)
  const lastDay = Number(range[1])
  const lastMonth = lastDay < day ? month + 1 : month
  return calendarDate(
    lastMonth > 12 ? year + 1 : year,
    lastMonth > 12 ? 1 : lastMonth,
    lastDay
  )
}

function numericTitleDates(title: string, reference: string): string[] {
  const dates: string[] = []
  for (const match of title.matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b/g)) {
    const value = calendarDate(
      Number(match[1]),
      Number(match[2]),
      Number(match[3])
    )
    if (value) dates.push(value)
  }
  for (const match of title.matchAll(/\b(\d{1,2})[/-](\d{1,2})\b/g)) {
    // Do not reinterpret the month/day inside an ISO date as another date.
    const index = match.index ?? 0
    if (index > 0 && /[/-]/.test(title[index - 1])) continue
    const suffix = title.slice(index + match[0].length)
    const year = /^[/-](\d{4})\b/.exec(suffix)
    const value = year
      ? calendarDate(Number(year[1]), Number(match[2]), Number(match[1]))
      : inferredDate(Number(match[2]), Number(match[1]), reference)
    if (value) dates.push(value)
  }
  return dates
}

// Only an explicit date in the title can expire a story. Neither publication
// age, a dated URL nor a word such as "hoy" is itself an expiry condition.
export function isHeadlineCurrent(
  article: DatedHeadline,
  today: string
): boolean {
  const title = cleanText(article.title ?? '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
  const dates: string[] = []
  const reference = today
  const add = (day: number, month: number, year?: number) => {
    const value = year
      ? calendarDate(year, month, day)
      : inferredDate(month, day, reference)
    if (value) dates.push(value)
    return value
  }
  const namedDate = /\b(\d{1,2}) (?:de )?([a-z]{4,10})\b/g
  for (const match of title.matchAll(namedDate)) {
    const month = match[2] === 'setiembre' ? 9 : MONTHS.indexOf(match[2]) + 1
    if (!month) continue
    const suffix = title.slice((match.index ?? 0) + match[0].length)
    const year = /^[, ]{1,3}(?:de |del )?(\d{4})\b/.exec(suffix)
    const start = add(
      Number(match[1]),
      month,
      year ? Number(year[1]) : undefined
    )
    const end =
      start &&
      abbreviatedRangeEnd(start, year ? suffix.slice(year[0].length) : suffix)
    if (end) dates.push(end)
  }
  dates.push(...numericTitleDates(title, reference))
  return !dates.length || dates.some(date => date >= today)
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

// Recheck cached content against the current editorial day, not publication age.
export function filterHomeHeadlineDates(
  data: HomeV2Data,
  day: string
): HomeV2Data {
  const sections = Object.fromEntries(
    Object.entries(data.sections).map(([id, articles]) => [
      id,
      articles.filter(article => isHeadlineCurrent(article, day))
    ])
  )
  return {
    ...data,
    sections,
    featured:
      data.featured && isHeadlineCurrent(data.featured, day)
        ? data.featured
        : selectFeaturedArticle(sections.opening ?? [])
  }
}
