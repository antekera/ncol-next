import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createClient } from '@lib/supabase/server'

// Proxies tag-subscription reads/writes to ncol-legales' internal API.
// The Supabase session cookie is shared between the two apps, so the user
// is resolved here and only their id crosses the wire to ncol-legales,
// authenticated with a server-to-server shared secret.
async function getAuthenticatedUserId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

function legalesInternalUrl(path: string): string {
  const base = (process.env.NCOL_LEGALES_API_URL || '').replace(/\/$/, '')
  return `${base}/api/internal/tag-subscriptions${path}`
}

function internalHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-internal-secret': process.env.NCOL_INTERNAL_API_SECRET || ''
  }
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

  try {
    const res = await fetch(
      legalesInternalUrl(
        `?userId=${encodeURIComponent(userId)}&tagSlug=${encodeURIComponent(tagSlug)}`
      ),
      { headers: internalHeaders(), cache: 'no-store' }
    )
    if (!res.ok) {
      return NextResponse.json({ subscribed: false }, { status: 502 })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json({ subscribed: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  try {
    const { tagSlug } = await request.json()
    if (!tagSlug) {
      return NextResponse.json({ error: 'missing tagSlug' }, { status: 400 })
    }

    const res = await fetch(legalesInternalUrl(''), {
      method: 'POST',
      headers: internalHeaders(),
      body: JSON.stringify({ userId, tagSlug })
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'upstream error' }, { status: 502 })
    }
    return NextResponse.json(await res.json())
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  try {
    const { tagSlug } = await request.json()
    if (!tagSlug) {
      return NextResponse.json({ error: 'missing tagSlug' }, { status: 400 })
    }

    const res = await fetch(legalesInternalUrl(''), {
      method: 'DELETE',
      headers: internalHeaders(),
      body: JSON.stringify({ userId, tagSlug })
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'upstream error' }, { status: 502 })
    }
    return NextResponse.json(await res.json())
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}
