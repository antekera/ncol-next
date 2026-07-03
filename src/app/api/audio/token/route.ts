import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function cleanText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, ' ') // eslint-disable-line sonarjs/slow-regex
    .trim()
    .slice(0, 3000)
}

function generateAudioToken(postId: string | number, textHash: string) {
  const expiresAt = Date.now() + 5 * 60 * 1000
  const payload = JSON.stringify({ postId, expiresAt, textHash })
  const encoded = Buffer.from(payload).toString('base64')
  const sig = crypto
    .createHmac('sha256', process.env.AUDIO_SECRET!)
    .update(encoded)
    .digest('hex')
  return `${encoded}.${sig}`
}

export async function POST(req: NextRequest) {
  if (!process.env.AUDIO_SECRET) {
    return NextResponse.json(
      { error: 'Server misconfiguration' },
      { status: 500 }
    )
  }

  let postId: string | undefined
  let text: string | undefined

  try {
    const body = await req.json()
    postId = body.postId
    text = body.text
  } catch {
    return NextResponse.json({ error: 'postId is required' }, { status: 400 })
  }

  if (!postId) {
    return NextResponse.json({ error: 'postId is required' }, { status: 400 })
  }

  const textHash = crypto
    .createHash('sha256')
    .update(cleanText(text ?? ''))
    .digest('hex')

  const token = generateAudioToken(postId, textHash)
  return NextResponse.json({ token })
}
