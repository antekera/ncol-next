import { NextResponse } from 'next/server'

// Old tabs must not create or delete subscriptions after alerts are disabled.
// Existing subscription data is retained for a reversible rollout.
export async function GET() {
  return NextResponse.json(
    { error: 'notifications_disabled', subscribed: false },
    { status: 410, headers: { 'Cache-Control': 'no-store' } }
  )
}

export const POST = GET
export const DELETE = GET
