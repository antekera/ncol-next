import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export const dynamic = 'force-dynamic'

// OneSignal accepts several thousand aliases per call — batch conservatively
// well under any documented limit so a single popular-tag post never fails
// a whole send because of one oversized request.
const ONESIGNAL_BATCH_SIZE = 1900

type WpTag = { id?: number; slug: string }

type WpPublishPayload = {
  postId: string
  title: string
  permalink: string
  imageUrl?: string | null
  tags: WpTag[]
}

async function getSubscribedUserIds(tagSlugs: string[]): Promise<string[]> {
  const base = (process.env.NCOL_LEGALES_API_URL || '').replace(/\/$/, '')
  const res = await fetch(
    `${base}/api/internal/tag-subscriptions/recipients`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': process.env.NCOL_INTERNAL_API_SECRET || ''
      },
      body: JSON.stringify({ tagSlugs })
    }
  )

  if (!res.ok) {
    throw new Error(`ncol-legales recipients lookup failed: HTTP ${res.status}`)
  }

  const data = await res.json()
  return Array.isArray(data.userIds) ? data.userIds : []
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

async function sendOneSignalPush(
  userIds: string[],
  payload: WpPublishPayload
): Promise<void> {
  const appId = process.env.ONESIGNAL_APP_ID
  const apiKey = process.env.ONESIGNAL_API_KEY

  if (!appId || !apiKey) {
    throw new Error('OneSignal is not configured (ONESIGNAL_APP_ID / ONESIGNAL_API_KEY)')
  }

  const batches = chunk(userIds, ONESIGNAL_BATCH_SIZE)

  for (const batch of batches) {
    const res = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${apiKey}`
      },
      body: JSON.stringify({
        app_id: appId,
        target_channel: 'push',
        include_aliases: { external_id: batch },
        headings: { es: payload.title },
        contents: { es: 'Toca para leer la noticia completa.' },
        url: payload.permalink,
        ...(payload.imageUrl
          ? {
              big_picture: payload.imageUrl,
              chrome_web_image: payload.imageUrl
            }
          : {})
      })
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`OneSignal request failed: HTTP ${res.status} - ${body}`)
    }
  }
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

  if (!payload.postId || !Array.isArray(payload.tags) || payload.tags.length === 0) {
    return NextResponse.json({ ok: true, notified: 0, reason: 'no tags' })
  }

  const tagSlugs = payload.tags.map(tag => tag.slug).filter(Boolean)

  try {
    // One lookup across ALL of the post's tags, deduplicated by user —
    // a reader subscribed to more than one matching tag gets exactly one push.
    const userIds = await getSubscribedUserIds(tagSlugs)

    if (userIds.length === 0) {
      return NextResponse.json({ ok: true, notified: 0 })
    }

    await sendOneSignalPush(userIds, payload)

    return NextResponse.json({ ok: true, notified: userIds.length })
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}
