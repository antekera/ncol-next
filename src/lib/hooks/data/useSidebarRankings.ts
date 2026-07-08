'use client'

import useSWR from 'swr'
import { tursoViewsPublic } from '@lib/tursoPublic'

interface RankedPost {
  slug: string
  title: string
  image: string
}

export interface SidebarRankingsApiResponse {
  mostRead: RankedPost[]
  mostViewedToday: RankedPost[]
}

function extractImageUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''

  if (trimmed.includes(',')) {
    const firstCandidate = trimmed.split(',')[0]?.trim() ?? ''
    const lastSpace = firstCandidate.lastIndexOf(' ')
    return lastSpace > 0
      ? firstCandidate.slice(0, lastSpace).trim()
      : firstCandidate
  }

  const lastSpace = trimmed.lastIndexOf(' ')
  if (lastSpace > 0 && /\s\d+w$/.test(trimmed)) {
    return trimmed.slice(0, lastSpace).trim()
  }

  return trimmed
}

const SECTION_MAP = {
  mostRead: 'mostRead',
  mostViewedToday: 'mostViewedToday'
} as const

export const useSidebarRankings = ({ load }: { load: boolean }) => {
  const { data, error, isLoading } = useSWR<SidebarRankingsApiResponse>(
    load ? 'sidebar-rankings' : null,
    async () => {
      const result = await tursoViewsPublic.execute({
        sql: `
          WITH ranges(section, days) AS (
            VALUES ('mostRead', 5), ('mostViewedToday', 1)
          ),
          aggregated AS (
            SELECT
              ranges.section AS section,
              CAST(post_slug AS TEXT) AS post_slug,
              CAST(MAX(title) AS TEXT) AS title,
              CAST(MAX(featured_image) AS TEXT) AS featured_image,
              CAST(SUM(count) AS INTEGER) AS total_views
            FROM visits
            JOIN ranges
              ON datetime(created_at) >= datetime('now', '-' || ranges.days || ' days')
            WHERE created_at IS NOT NULL
            GROUP BY ranges.section, post_slug
          ),
          ranked AS (
            SELECT
              section,
              post_slug,
              title,
              featured_image,
              ROW_NUMBER() OVER (
                PARTITION BY section
                ORDER BY total_views DESC
              ) AS position
            FROM aggregated
          )
          SELECT
            section,
            post_slug,
            title,
            featured_image
          FROM ranked
          WHERE position <= 5
          ORDER BY
            CASE section
              WHEN 'mostRead' THEN 1
              ELSE 2
            END,
            position
        `
      })

      const rankings: SidebarRankingsApiResponse = {
        mostRead: [],
        mostViewedToday: []
      }

      result.rows.forEach(row => {
        const section = row[0] as keyof typeof SECTION_MAP
        const target = SECTION_MAP[section]

        if (!target) {
          return
        }

        rankings[target].push({
          slug: row[1] as string,
          title: row[2] as string,
          image: extractImageUrl((row[3] as string) ?? '')
        })
      })

      return rankings
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60 * 60 * 1000,
      keepPreviousData: true
    }
  )

  return { data, error, isLoading }
}
