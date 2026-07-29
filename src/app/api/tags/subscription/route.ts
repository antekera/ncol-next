import { NextRequest, NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import * as Sentry from '@sentry/nextjs'
import { createClient } from '@lib/supabase/server'
import { db } from '@lib/db'
import { ncolTagSubscriptions } from '@lib/db/schema'

// Reads/writes ncol_tag_subscriptions directly — same Supabase project as
// the auth session, so no cross-repo call is needed. The user is resolved
// from the session cookie shared with ncol-legales.
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

  try {
    const existing = await db.query.ncolTagSubscriptions.findFirst({
      where: and(
        eq(ncolTagSubscriptions.userId, userId),
        eq(ncolTagSubscriptions.tagSlug, tagSlug)
      )
    })
    return NextResponse.json({ subscribed: Boolean(existing) })
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

  const { tagSlug } = await request.json()
  if (!tagSlug) {
    return NextResponse.json({ error: 'missing tagSlug' }, { status: 400 })
  }

  try {
    await db
      .insert(ncolTagSubscriptions)
      .values({ userId, tagSlug })
      .onConflictDoNothing()
    return NextResponse.json({ subscribed: true })
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

  const { tagSlug } = await request.json()
  if (!tagSlug) {
    return NextResponse.json({ error: 'missing tagSlug' }, { status: 400 })
  }

  try {
    await db
      .delete(ncolTagSubscriptions)
      .where(
        and(
          eq(ncolTagSubscriptions.userId, userId),
          eq(ncolTagSubscriptions.tagSlug, tagSlug)
        )
      )
    return NextResponse.json({ subscribed: false })
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}
