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
