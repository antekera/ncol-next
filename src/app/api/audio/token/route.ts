import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function generateAudioToken(postId: string | number) {
  const expiresAt = Date.now() + 5 * 60 * 1000
  const payload = JSON.stringify({ postId, expiresAt })
  const encoded = Buffer.from(payload).toString('base64')
  const sig = crypto
    .createHmac('sha256', process.env.AUDIO_SECRET!)
    .update(encoded)
    .digest('hex')
  return `${encoded}.${sig}`
}

export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get('postId')
  if (!postId) {
    return NextResponse.json({ error: 'postId is required' }, { status: 400 })
  }

  if (!process.env.AUDIO_SECRET) {
    return NextResponse.json(
      { error: 'Server misconfiguration' },
      { status: 500 }
    )
  }

  const token = generateAudioToken(postId)
  return NextResponse.json({ token })
}
