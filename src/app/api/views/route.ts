/**
 * Handles POST requests to flush (increment) the view count for a specific post.
 *
 * This endpoint expects a JSON body with the following properties:
 * - `slug` (string): The unique identifier for the post.
 * - `count` (number): The number of views to increment for the given post.
 *
 * This call is used to track and update the number of views for posts, supporting analytics or popularity features.
 *
 * @param req - The incoming Next.js request object containing the JSON body.
 * @returns A JSON response with the updated count or an error message.
 */

import { NextRequest } from 'next/server'
import { turso } from '@lib/turso'
import * as Sentry from '@sentry/nextjs'

export async function POST(req: NextRequest) {
  let slug: string | undefined
  let count: number | undefined

  try {
    const body = await req.json()
    slug = body.slug
    count = body.count
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Invalid or missing JSON body', details: error }),
      {
        status: 400
      }
    )
  }

  if (!slug || typeof count !== 'number' || count < 0) {
    return new Response(JSON.stringify({ error: 'Invalid slug or count' }), {
      status: 400
    })
  }

  try {
    await turso.execute({
      sql: `
        INSERT INTO visits (post_slug, count)
        VALUES (?, ?)
        ON CONFLICT(post_slug)
        DO UPDATE SET count = count + excluded.count
      `,
      args: [slug, count]
    })

    const result = await turso.execute({
      sql: 'SELECT count FROM visits WHERE post_slug = ?',
      args: [slug]
    })

    return Response.json({ count: result.rows?.[0]?.[0] ?? 0 })
  } catch (err) {
    Sentry.captureException(err)
    return new Response(
      JSON.stringify({ error: 'Database error', details: err }),
      {
        status: 500
      }
    )
  }
}
