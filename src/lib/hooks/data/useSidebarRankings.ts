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

export const useSidebarRankings = ({ load }: { load: boolean }) => {
  const { data, error, isLoading } = useSWR<SidebarRankingsApiResponse>(
    load ? 'sidebar-rankings' : null,
    async () => {
      const getRankedPosts = async (days: number) => {
        const result = await tursoViewsPublic.execute({
          sql: `
            SELECT
              CAST(post_slug AS TEXT) AS post_slug,
              CAST(MAX(title) AS TEXT) AS title,
              CAST(MAX(featured_image) AS TEXT) AS featured_image
            FROM visits
            WHERE created_at IS NOT NULL
              AND datetime(created_at) >= datetime('now', '-' || ? || ' days')
            GROUP BY post_slug
            ORDER BY SUM(count) DESC
            LIMIT 5
          `,
          args: [days]
        })

        return result.rows.map(row => ({
          slug: row[0] as string,
          title: row[1] as string,
          image: extractImageUrl((row[2] as string) ?? '')
        }))
      }

      const [mostRead, mostViewedToday] = await Promise.all([
        getRankedPosts(5),
        getRankedPosts(1)
      ])

      return {
        mostRead,
        mostViewedToday
      }
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
