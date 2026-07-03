import crypto from 'crypto'
import { Readable } from 'stream'
import { NextRequest, NextResponse } from 'next/server'
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly'
import {
  S3Client,
  HeadObjectCommand,
  PutObjectCommand
} from '@aws-sdk/client-s3'

export const dynamic = 'force-dynamic'

function verifyAudioToken(token: string, postId: string | number): boolean {
  const [encoded, sig] = token.split('.')
  if (!encoded || !sig) return false
  const expectedSig = crypto
    .createHmac('sha256', process.env.AUDIO_SECRET!)
    .update(encoded)
    .digest('hex')
  if (sig !== expectedSig) return false
  const { postId: tokenPostId, expiresAt } = JSON.parse(
    Buffer.from(encoded, 'base64').toString('utf8')
  )
  if (Date.now() > expiresAt) return false
  if (String(tokenPostId) !== String(postId)) return false
  return true
}

const polly = new PollyClient({ region: process.env.AWS_REGION ?? 'us-east-1' })
const s3 = new S3Client({ region: process.env.AWS_REGION ?? 'us-east-1' })

export async function POST(req: NextRequest) {
  let postId: string | number
  let text: string
  let token: string

  try {
    const body = await req.json()
    postId = body.postId
    text = body.text
    token = body.token
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  if (!verifyAudioToken(token, postId)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const stripped = text.replace(/<[^>]*>/g, ' ') // eslint-disable-line sonarjs/slow-regex
    const cleanText = stripped.trim().slice(0, 3000)
    const bucket = process.env.AWS_S3_AUDIO_BUCKET!
    const baseUrl = process.env.AWS_S3_AUDIO_BASE_URL!
    const key = `audio/${postId}.mp3`
    const url = `${baseUrl}/${key}`

    try {
      await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
      return NextResponse.json({ url })
    } catch {
      // Object does not exist — fall through to generate
    }

    const pollyResult = await polly.send(
      new SynthesizeSpeechCommand({
        Engine: 'neural',
        VoiceId: 'Lupe',
        LanguageCode: 'es-US',
        OutputFormat: 'mp3',
        Text: cleanText
      })
    )

    const audioStream = pollyResult.AudioStream as Readable
    const chunks: Buffer[] = []
    for await (const chunk of audioStream) {
      chunks.push(
        Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as ArrayBuffer)
      )
    }
    const buffer = Buffer.concat(chunks)

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: 'audio/mpeg',
        Body: buffer
      })
    )

    return NextResponse.json({ url })
  } catch {
    return NextResponse.json(
      { error: 'No se pudo generar el audio' },
      { status: 500 }
    )
  }
}
