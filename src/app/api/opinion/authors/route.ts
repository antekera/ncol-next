import { NextResponse } from 'next/server'
import { getOpinionAuthors } from '@app/actions/getOpinionAuthors'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const authors = await getOpinionAuthors()
    return NextResponse.json(authors, {
      headers: {
        'Cache-Control':
          'public, max-age=0, s-maxage=1800, stale-while-revalidate=60'
      }
    })
  } catch {
    return NextResponse.json(
      { error: 'Opinion authors unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
