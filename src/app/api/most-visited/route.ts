/**
 * Handles GET requests to fetch the most visited posts from the last N days.
 *
 * Returns an array of posts with their view counts and last viewed timestamps,
 * ordered by total views in descending order.
 *
 * @param req - The incoming Next.js request object containing query parameters.
 * @returns A JSON response with the most visited posts or an error message.
 */

import { NextRequest } from 'next/server'
import { tursoViews } from '@lib/turso'
import * as Sentry from '@sentry/nextjs'
import type { MostVisitedApiResponse, MostVisitedDbRecord } from '@lib/types'
import { isDev } from '@lib/utils'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : 5
    const days = process.env.MOST_VISITED_DAYS ?? 7

    const result = await tursoViews.execute({
      sql: `
      SELECT 
        CAST(post_slug AS TEXT) AS post_slug, 
        CAST(SUM(count) AS INTEGER) AS total_views, 
        CAST(MAX(datetime(created_at)) AS TEXT) AS last_viewed,
        CAST(MAX(title) AS TEXT) AS title,
        CAST(MAX(featured_image) AS TEXT) AS featured_image
      FROM visits 
      WHERE created_at IS NOT NULL
        AND datetime(created_at) >= datetime('now', '-' || ? || ' days')
      GROUP BY post_slug 
      ORDER BY total_views DESC 
      LIMIT ?
      `,
      args: [days.toString(), limit.toString()]
    })

    if (!result.rows || result.rows.length === 0) {
      return Response.json({ posts: [] } as MostVisitedApiResponse)
    }

    const posts = result.rows.map(row => {
      const typedRow = row as unknown as MostVisitedDbRecord
      return {
        slug: typedRow.post_slug ?? Object.values(typedRow)[0],
        views: typedRow.total_views ?? Object.values(typedRow)[1],
        title: typedRow.title ?? null,
        image: typedRow.featured_image ?? null
      }
    })
    return Response.json({ posts } as MostVisitedApiResponse)
  } catch (err) {
    Sentry.captureException(err, {
      tags: {
        component: 'most-visited-api',
        operation: 'fetch-posts'
      },
      extra: {
        url: req.url,
        method: req.method
      }
    })

    return new Response(
      JSON.stringify({
        error: 'Database error occurred while fetching most visited posts',
        details: isDev ? err : undefined
      }),
      { status: 500 }
    )
  }
}
