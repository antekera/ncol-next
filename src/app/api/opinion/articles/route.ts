import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

import { createClient } from '@lib/supabase/server'

const requestSchema = z.object({
  token: z.string().min(8).max(255),
  title: z.string().trim().min(5).max(180),
  content: z.string().min(20).max(100_000),
  category: z.string().min(1).max(60),
  acceptedTerms: z.literal(true),
  termsVersion: z.string().min(1).max(40)
})

type PublishResult = {
  post: {
    id: number
    url?: string
    publishedAt?: string
    author: { name: string }
  }
  postStatus: string
}

async function sendEmailNotification(
  input: z.infer<typeof requestSchema>,
  result: PublishResult,
  userId: string
) {
  const isDraft = result.postStatus === 'draft'
  const resend = new Resend(process.env.RESEND_API_KEY)
  const subject = isDraft
    ? `[Borrador] Nuevo artículo de Opinión: ${input.title}`
    : `Nuevo artículo de Opinión: ${input.title}`
  await resend.emails.send({
    from: 'Opinión NoticiasCol <contacto@noticiascol.com>',
    to: process.env.OPINION_NOTIFICATION_EMAIL ?? 'prensa@noticiascol.com',
    subject,
    text: [
      `Autor: ${result.post.author.name}`,
      `Título: ${input.title}`,
      `Categoría: ${input.category}`,
      `Estado: ${isDraft ? 'Borrador — pendiente de revisión' : 'Publicado'}`,
      ...(result.post.publishedAt
        ? [`Publicado: ${result.post.publishedAt}`]
        : []),
      ...(result.post.url ? [`URL: ${result.post.url}`] : []),
      `Usuario Supabase: ${userId}`
    ].join('\n')
  })
}

async function sendTelegramNotification(
  input: z.infer<typeof requestSchema>,
  result: PublishResult
) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_OPINION_CHAT_ID
  if (!botToken || !chatId) return

  const isDraft = result.postStatus === 'draft'
  const wpAdminBase = process.env.WORDPRESS_OPINION_API_URL?.replace(
    /\/wp-json\/.*/,
    ''
  )
  const draftEditUrl =
    isDraft && wpAdminBase
      ? `${wpAdminBase}/wp-admin/post.php?post=${result.post.id}&action=edit`
      : null

  const lines = [
    isDraft
      ? '📝 <b>Nuevo artículo recibido</b>'
      : '✅ <b>Artículo publicado</b>',
    `<b>Categoría:</b> ${input.category}`,
    `<b>Autor:</b> ${result.post.author.name}`,
    `<b>Título:</b> ${input.title}`,
    ...(result.post.url ? [`<b>URL:</b> ${result.post.url}`] : []),
    ...(draftEditUrl ? [`<b>Revisar borrador:</b> ${draftEditUrl}`] : [])
  ]

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: lines.join('\n'),
      parse_mode: 'HTML'
    })
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { message: 'Debes iniciar sesión.' },
      { status: 401 }
    )
  }

  let input: z.infer<typeof requestSchema>
  try {
    input = requestSchema.parse(await request.json())
  } catch {
    return NextResponse.json(
      { message: 'Revisa el título, contenido y aceptación de términos.' },
      { status: 400 }
    )
  }

  const endpoint = process.env.WORDPRESS_OPINION_API_URL
  const secret = process.env.WORDPRESS_OPINION_API_SECRET

  if (!endpoint || !secret) {
    Sentry.captureMessage('Opinion WordPress API is not configured')
    return NextResponse.json(
      { message: 'El servicio de publicación no está configurado.' },
      { status: 503 }
    )
  }

  try {
    const wordpressResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-Opinion-Secret': secret,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: input.title,
        content: input.content,
        authorToken: input.token,
        category: input.category,
        termsVersion: input.termsVersion,
        acceptedAt: new Date().toISOString(),
        submittedBy: user.id
      }),
      cache: 'no-store'
    })

    const result = await wordpressResponse.json()
    if (!wordpressResponse.ok) {
      Sentry.captureMessage('WordPress opinion publication failed', {
        extra: { status: wordpressResponse.status, result }
      })
      return NextResponse.json(
        { message: result?.message ?? 'No se pudo publicar el artículo.' },
        { status: wordpressResponse.status }
      )
    }

    let notificationSent = false
    try {
      await sendEmailNotification(input, result, user.id)
      notificationSent = true
    } catch (error) {
      Sentry.captureException(error)
    }

    try {
      await sendTelegramNotification(input, result)
    } catch (error) {
      Sentry.captureException(error)
    }

    return NextResponse.json({ ...result, notificationSent }, { status: 201 })
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json(
      { message: 'Ocurrió un error al publicar el artículo.' },
      { status: 500 }
    )
  }
}
