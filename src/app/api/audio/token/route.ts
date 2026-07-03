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

export async function POST(req: NextRequest) {
  if (!process.env.AUDIO_SECRET) {
    return NextResponse.json(
      { error: 'Server misconfiguration' },
      { status: 500 }
    )
  }
  const secret = process.env.AUDIO_SECRET

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

  const token = generateAudioToken(postId, textHash, secret)
  return NextResponse.json({ token })
}
