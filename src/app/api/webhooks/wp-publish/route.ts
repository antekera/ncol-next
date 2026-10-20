import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.WP_PUSH_WEBHOOK_SECRET
  const providedSecret = request.headers.get('x-webhook-secret')

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // Acknowledge the existing WordPress hook without recipient queries or sends.
  // No queue/backfill is created for publications while alerts are disabled.
  return NextResponse.json(
    { ok: true, notified: 0, reason: 'notifications_disabled' },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
