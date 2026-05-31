import { NextRequest, NextResponse } from 'next/server'
import { cachedFetchAPI } from '@app/actions/fetchAPI'
import { log } from '@logtail/next'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { query, variables, revalidate = 300 } = body

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const data = await cachedFetchAPI({
      query,
      variables,
      revalidate,
      tags: ['graphql-proxy']
    })

    return NextResponse.json({ data })
  } catch (error) {
    log.error('GraphQL Proxy Error', {
      error: error instanceof Error ? error.message : String(error)
    })
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
