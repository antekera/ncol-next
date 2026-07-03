import crypto from 'crypto'
import { Readable } from 'stream'
import { NextRequest, NextResponse } from 'next/server'
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly'
import {
  S3Client,
  HeadObjectCommand,
  PutObjectCommand
} from '@aws-sdk/client-s3'
import { cleanText } from '@lib/utils/cleanText'

export const dynamic = 'force-dynamic'

function verifyAudioToken(
  token: string,
  postId: string | number,
  text: string,
  secret: string
): boolean {
  const [encoded, sig] = token.split('.')
  if (!encoded || !sig) return false
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(encoded)
    .digest('hex')
  const sigBuf = Buffer.from(sig, 'hex')
  const expectedBuf = Buffer.from(expectedSig, 'hex')
  if (sigBuf.length !== expectedBuf.length) return false
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false
  const tokenPayload: {
    postId: string | number
    expiresAt: number
    textHash: string
  } = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'))
  if (Date.now() > tokenPayload.expiresAt) return false
  if (String(tokenPayload.postId) !== String(postId)) return false
  if (!tokenPayload.textHash) return false
  const receivedHash = crypto
    .createHash('sha256')
    .update(cleanText(text))
    .digest('hex')
  if (receivedHash !== tokenPayload.textHash) return false
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

  if (!process.env.AUDIO_SECRET) {
    return NextResponse.json(
      { error: 'No se pudo generar el audio' },
      { status: 500 }
    )
  }
  const secret = process.env.AUDIO_SECRET

  if (!verifyAudioToken(token, postId, text, secret)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const cleaned = cleanText(text)
    const bucket = process.env.AWS_S3_AUDIO_BUCKET!
    const baseUrl = process.env.AWS_S3_AUDIO_BASE_URL!
    const key = `audio/${postId}.mp3`
    const url = `${baseUrl}/${key}`

    try {
      await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
      return NextResponse.json({ url })
    } catch (err: unknown) {
      const code = (err as any)?.name ?? (err as any)?.$metadata?.httpStatusCode
      if (code !== 'NotFound' && code !== 404) throw err
    }

    const pollyResult = await polly.send(
      new SynthesizeSpeechCommand({
        Engine: 'neural',
        VoiceId: 'Lupe',
        LanguageCode: 'es-US',
        OutputFormat: 'mp3',
        Text: cleaned
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
