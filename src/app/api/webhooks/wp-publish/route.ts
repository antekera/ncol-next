import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { ncolLegalesClient } from '@lib/api/NcolLegalesClient'
import { oneSignalClient } from '@lib/api/OneSignalClient'

export const dynamic = 'force-dynamic'

type WpTag = { id?: number; slug: string }

type WpPublishPayload = {
  postId: string
  title: string
  permalink: string
  imageUrl?: string | null
  tags: WpTag[]
}

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.WP_PUSH_WEBHOOK_SECRET
  const providedSecret = request.headers.get('x-webhook-secret')

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let payload: WpPublishPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  if (
    !payload.postId ||
    !Array.isArray(payload.tags) ||
    payload.tags.length === 0
  ) {
    return NextResponse.json({ ok: true, notified: 0, reason: 'no tags' })
  }

  const tagSlugs = payload.tags.map(tag => tag.slug).filter(Boolean)

  try {
    // One lookup across ALL of the post's tags, deduplicated by user —
    // a reader subscribed to more than one matching tag gets exactly one push.
    const userIds = await ncolLegalesClient.getTagSubscribers(tagSlugs)

    if (userIds.length === 0) {
      return NextResponse.json({ ok: true, notified: 0 })
    }

    await oneSignalClient.sendPushToUsers(userIds, {
      title: payload.title,
      url: payload.permalink,
      imageUrl: payload.imageUrl
    })

    return NextResponse.json({ ok: true, notified: userIds.length })
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}
