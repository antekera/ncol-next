import { NextRequest } from 'next/server'
import { turso } from '@lib/turso'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')

  if (!slug) {
    return new Response(JSON.stringify({ error: 'Missing slug' }), {
      status: 400
    })
  }

  try {
    const result = await turso.execute({
      sql: 'SELECT count FROM visits WHERE post_slug = ?',
      args: [slug]
    })

    const count = result.rows?.[0]?.[0] ?? 0
    return Response.json({ count })
  } catch (error) {
    return new Response(JSON.stringify({ error }), {
      status: 500
    })
  }
}
