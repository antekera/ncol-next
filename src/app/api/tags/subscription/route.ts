import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@lib/supabase/server'
import { ncolLegalesClient } from '@lib/api/NcolLegalesClient'

// Proxies tag-subscription reads/writes to ncol-legales' internal API.
// The Supabase session cookie is shared between the two apps, so the user
// is resolved here and only their id crosses the wire to ncol-legales,
// authenticated with a server-to-server shared secret (NcolLegalesClient).
async function getAuthenticatedUserId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

export async function GET(request: NextRequest) {
  const tagSlug = request.nextUrl.searchParams.get('tagSlug')
  if (!tagSlug) {
    return NextResponse.json({ error: 'missing tagSlug' }, { status: 400 })
  }

  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ subscribed: false }, { status: 401 })
  }

  const subscribed = await ncolLegalesClient.getSubscriptionStatus(
    userId,
    tagSlug
  )
  if (subscribed === null) {
    return NextResponse.json({ subscribed: false }, { status: 502 })
  }
  return NextResponse.json({ subscribed })
}

export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const { tagSlug } = await request.json()
  if (!tagSlug) {
    return NextResponse.json({ error: 'missing tagSlug' }, { status: 400 })
  }

  const ok = await ncolLegalesClient.subscribe(userId, tagSlug)
  if (!ok) {
    return NextResponse.json({ error: 'upstream error' }, { status: 502 })
  }
  return NextResponse.json({ subscribed: true })
}

export async function DELETE(request: NextRequest) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const { tagSlug } = await request.json()
  if (!tagSlug) {
    return NextResponse.json({ error: 'missing tagSlug' }, { status: 400 })
  }

  const ok = await ncolLegalesClient.unsubscribe(userId, tagSlug)
  if (!ok) {
    return NextResponse.json({ error: 'upstream error' }, { status: 502 })
  }
  return NextResponse.json({ subscribed: false })
}
