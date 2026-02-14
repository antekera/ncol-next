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

export const dynamic = 'force-dynamic'

// Constants for parameter validation
const DEFAULT_LIMIT = 5
const MAX_LIMIT = 50
const DEFAULT_DAYS = 7
const MAX_DAYS = 365

/**
 * Safely parse and validate a numeric parameter.
 * Returns null if the value is not a valid positive integer within bounds.
 */
function parseNumericParam(
  value: string | null,
  defaultValue: number,
  maxValue: number
): number | null {
  if (!value) return defaultValue

  // Only allow digits (no negative signs, decimals, or other characters)
  if (!/^\d+$/.test(value)) {
    return null
  }

  const parsed = parseInt(value, 10)

  // Check if it's a valid number within bounds
  if (isNaN(parsed) || parsed < 1 || parsed > maxValue) {
    return null
  }

  return parsed
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    // Validate and sanitize 'limit' parameter
    const limitParam = searchParams.get('limit')
    const limit = parseNumericParam(limitParam, DEFAULT_LIMIT, MAX_LIMIT)

    if (limit === null) {
      return new Response(
        JSON.stringify({ error: 'Invalid limit parameter' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate and sanitize 'days' parameter
    const daysParam =
      searchParams.get('days') ?? process.env.MOST_VISITED_DAYS ?? '7'
    const days = parseNumericParam(daysParam.toString(), DEFAULT_DAYS, MAX_DAYS)

    if (days === null) {
      return new Response(JSON.stringify({ error: 'Invalid days parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const result = await tursoViews.execute({
      sql: `
      SELECT 
        CAST(post_slug AS TEXT) AS post_slug, 
        CAST(SUM(count) AS INTEGER) AS total_views, 
        CAST(MAX(datetime(created_at)) AS TEXT) AS last_viewed,
        CAST(MAX(title) AS TEXT) AS title,
        CAST(MAX(featured_image) AS TEXT) AS featured_image,
        CAST(MAX(datetime(created_at)) AS TEXT) AS created_at
      FROM visits 
      WHERE created_at IS NOT NULL
        AND datetime(created_at) >= datetime('now', '-' || ? || ' days')
      GROUP BY post_slug 
      ORDER BY total_views DESC 
      LIMIT ?
      `,
      args: [days, limit]
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
        image: typedRow.featured_image ?? null,
        created_at: (row as any).created_at ?? null
      }
    })
    return new Response(JSON.stringify({ posts } as MostVisitedApiResponse), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      }
    })
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
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        }
      }
    )
  }
}
