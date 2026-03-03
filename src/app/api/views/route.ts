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
import { tursoViews } from '@lib/turso'
import * as Sentry from '@sentry/nextjs'

export async function POST(req: NextRequest) {
  let slug: string | undefined
  let count: number | undefined
  let featuredImage: string | undefined
  let title: string | undefined

  try {
    const body = await req.json()
    slug = body.slug
    featuredImage = body.featuredImage
    title = body.title
    count = body.count
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('JSON Parse Error in /api/views:', error)
    Sentry.captureException(error)
    return new Response(
      JSON.stringify({ error: 'Invalid or missing JSON body', details: error }),
      {
        status: 400
      }
    )
  }

  if (
    typeof slug !== 'string' ||
    !slug ||
    typeof count !== 'number' ||
    count < 0 ||
    typeof title !== 'string' ||
    !title ||
    typeof featuredImage !== 'string' ||
    !featuredImage
  ) {
    return new Response(
      JSON.stringify({ error: 'Invalid payload types or missing fields' }),
      {
        status: 400
      }
    )
  }

  try {
    const createdAt = new Date().toISOString()
    await tursoViews.execute({
      sql: `
      INSERT INTO visits (post_slug, count, created_at, title, featured_image)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(post_slug)
      DO UPDATE SET
        count = visits.count + excluded.count,
        created_at = COALESCE(visits.created_at, excluded.created_at),
        title = excluded.title,
        featured_image = excluded.featured_image
      `,
      args: [slug, count, createdAt, title, featuredImage]
    })

    const result = await tursoViews.execute({
      sql: 'SELECT count, created_at FROM visits WHERE post_slug = ? AND created_at IS NOT NULL',
      args: [slug]
    })

    if (!result.rows || result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404
      })
    }

    const countResult = result.rows?.[0]?.[0] ?? 0
    return Response.json({ count: countResult })
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
