'use client'

import useSWR from 'swr'
import { tursoViewsPublic } from '@lib/tursoPublic'
import { MostVisitedApiResponse } from '@lib/types'

const DEFAULT_LIMIT = 5
const DEFAULT_DAYS = 7

export const useMostVisitedPosts = ({
  load,
  limit = DEFAULT_LIMIT,
  days = DEFAULT_DAYS
}: {
  load: boolean
  limit?: number
  days?: number
}) => {
  const { data, error, isLoading } = useSWR<MostVisitedApiResponse>(
    load ? `most-visited-${limit}-${days}` : null,
    async () => {
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
          LIMIT ?
        `,
        args: [days, limit]
      })

      return {
        posts: result.rows.map(row => ({
          slug: row[0] as string,
          title: row[1] as string,
          image: row[2] as string
        }))
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60 * 60 * 1000,
      keepPreviousData: true
    }
  )

  return { data, isLoading, error }
}
