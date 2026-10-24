import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { isHomeV2DurableCacheEnabled } from '@lib/homeV2/release'

export const dynamic = 'force-dynamic'

const response = (body: unknown, status: number) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

/** Protected prewarm / batch processor. No scheduler is activated by this file. */
export async function GET(request: NextRequest) {
  if (!isHomeV2DurableCacheEnabled())
    return response({ error: 'not found' }, 404)
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`)
    return response({ error: 'unauthorized' }, 401)
  try {
    const { refreshPublicHomeSnapshot } =
      await import('@lib/homeV2/publicSnapshot')
    return response({ ok: true, ...(await refreshPublicHomeSnapshot()) }, 200)
  } catch (error) {
    Sentry.captureException(error)
    return response({ error: 'Home refresh unavailable' }, 503)
  }
}

export const POST = GET
