import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { cleanText } from '@lib/utils/cleanText'

export const dynamic = 'force-dynamic'

function generateAudioToken(
  postId: string | number,
  textHash: string,
  secret: string
) {
  const expiresAt = Date.now() + 5 * 60 * 1000
  const payload = JSON.stringify({ postId, expiresAt, textHash })
  const encoded = Buffer.from(payload).toString('base64')
  const sig = crypto.createHmac('sha256', secret).update(encoded).digest('hex')
  return `${encoded}.${sig}`
}

function getWpJsonBase(): string {
  const explicit = (
    process.env.WORDPRESS_JSON_URL ||
    process.env.NEXT_PUBLIC_WORDPRESS_JSON_URL ||
    ''
  ).trim()
  if (explicit) return explicit.replace(/\/$/, '')

  return (
    (process.env.WORDPRESS_API_URL ?? '')
      .trim()
      // eslint-disable-next-line security/detect-unsafe-regex -- input is a trusted env var (WORDPRESS_API_URL)
      .replace(/\/graphql(\/.*)?$/, '/wp-json')
  )
}

function getWpAuthHeader(): HeadersInit {
  const user = process.env.WP_USER
  const pass = process.env.WP_PASSWORD
  if (!user || !pass) return {}
  return {
    Authorization: 'Basic ' + Buffer.from(user + ':' + pass).toString('base64')
  }
}

async function fetchPostContent(postId: string | number): Promise<string> {
  const base = getWpJsonBase()
  const res = await fetch(`${base}/wp/v2/posts/${postId}?_fields=content`, {
    headers: getWpAuthHeader(),
    next: { revalidate: 0 }
  })
  if (!res.ok) throw new Error(`WP post fetch failed: ${res.status}`)
  const data = (await res.json()) as { content?: { rendered?: string } }
  return data?.content?.rendered ?? ''
}

export async function POST(req: NextRequest) {
  if (!process.env.AUDIO_SECRET) {
    return NextResponse.json(
      { error: 'Server misconfiguration' },
      { status: 500 }
    )
  }
  const secret = process.env.AUDIO_SECRET

  let postId: string | undefined

  try {
    const body = await req.json()
    postId = body.postId
  } catch {
    return NextResponse.json({ error: 'postId is required' }, { status: 400 })
  }

  if (!postId) {
    return NextResponse.json({ error: 'postId is required' }, { status: 400 })
  }

  let wpContent: string
  try {
    wpContent = await fetchPostContent(postId)
  } catch {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  if (!wpContent) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  const textHash = crypto
    .createHash('sha256')
    .update(cleanText(wpContent))
    .digest('hex')

  const token = generateAudioToken(postId, textHash, secret)
  return NextResponse.json({ token })
}
