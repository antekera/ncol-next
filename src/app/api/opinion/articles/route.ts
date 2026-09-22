import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

import { OpinionClient } from '@lib/api/OpinionClient'

const requestSchema = z.object({
  token: z.string().min(8).max(255),
  title: z.string().trim().min(5).max(180),
  content: z.string().min(20).max(100_000),
  category: z.string().min(1).max(60),
  acceptedTerms: z.literal(true),
  termsVersion: z.string().min(1).max(40),
  featuredMediaId: z.number().int().positive().optional()
})

type Input = z.infer<typeof requestSchema>

async function sendEmailNotification(
  input: Input,
  result: NonNullable<Awaited<ReturnType<OpinionClient['publishArticle']>>>,
  authorSlug: string
) {
  const isDraft = result.data.postStatus === 'draft'
  const resend = new Resend(process.env.RESEND_API_KEY)
  const subject = isDraft
    ? `[Borrador] Nuevo artículo de Opinión: ${input.title}`
    : `Nuevo artículo de Opinión: ${input.title}`
  await resend.emails.send({
    from: 'Opinión NoticiasCol <contacto@noticiascol.com>',
    to: process.env.OPINION_NOTIFICATION_EMAIL ?? 'prensa@noticiascol.com',
    subject,
    text: [
      `Autor: ${result.data.post.author.name}`,
      `Título: ${input.title}`,
      `Categoría: ${input.category}`,
      `Estado: ${isDraft ? 'Borrador — pendiente de revisión' : 'Publicado'}`,
      ...(result.data.post.publishedAt
        ? [`Publicado: ${result.data.post.publishedAt}`]
        : []),
      ...(result.data.post.url ? [`URL: ${result.data.post.url}`] : []),
      `Autor (slug): ${authorSlug}`
    ].join('\n')
  })
}

async function sendTelegramNotification(
  input: Input,
  result: NonNullable<Awaited<ReturnType<OpinionClient['publishArticle']>>>
) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_OPINION_CHAT_ID
  if (!botToken || !chatId) return

  const isDraft = result.data.postStatus === 'draft'
  const wpAdminBase = process.env.WORDPRESS_OPINION_API_URL?.replace(
    /\/wp-json\/.*/,
    ''
  )
  const draftEditUrl =
    isDraft && wpAdminBase
      ? `${wpAdminBase}/wp-admin/post.php?post=${result.data.post.id}&action=edit`
      : null

  const lines = [
    isDraft
      ? '📝 <b>Nuevo artículo recibido</b>'
      : '✅ <b>Artículo publicado</b>',
    `<b>Categoría:</b> ${input.category}`,
    `<b>Autor:</b> ${result.data.post.author.name}`,
    `<b>Título:</b> ${input.title}`,
    ...(result.data.post.url ? [`<b>URL:</b> ${result.data.post.url}`] : []),
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
  let input: Input
  try {
    input = requestSchema.parse(await request.json())
  } catch {
    return NextResponse.json(
      { message: 'Revisa el título, contenido y aceptación de términos.' },
      { status: 400 }
    )
  }

  const opinion = new OpinionClient()
  if (!opinion.isConfigured) {
    Sentry.captureMessage('Opinion WordPress API is not configured')
    return NextResponse.json(
      { message: 'El servicio de publicación no está configurado.' },
      { status: 503 }
    )
  }

  const authorInfo = await opinion.getAuthorInfo(input.token)
  if (!authorInfo.ok) {
    return NextResponse.json(
      { message: 'Token de autor inválido o no autorizado.' },
      { status: 401 }
    )
  }

  const wpResult = await opinion.publishArticle({
    title: input.title,
    content: input.content,
    authorToken: input.token,
    category: input.category,
    termsVersion: input.termsVersion,
    acceptedAt: new Date().toISOString(),
    submittedBy: authorInfo.slug,
    ...(input.featuredMediaId ? { featuredMediaId: input.featuredMediaId } : {})
  })

  if (!wpResult) {
    return NextResponse.json(
      { message: 'Ocurrió un error al publicar el artículo.' },
      { status: 500 }
    )
  }

  if (wpResult.status >= 400) {
    Sentry.captureMessage('WordPress opinion publication failed', {
      extra: { status: wpResult.status, result: wpResult.data }
    })
    return NextResponse.json(
      { message: wpResult.data?.post ?? 'No se pudo publicar el artículo.' },
      { status: wpResult.status }
    )
  }

  let notificationSent = false
  try {
    await sendEmailNotification(input, wpResult, authorInfo.slug)
    notificationSent = true
  } catch (error) {
    Sentry.captureException(error)
  }

  try {
    await sendTelegramNotification(input, wpResult)
  } catch (error) {
    Sentry.captureException(error)
  }

  return NextResponse.json(
    { ...wpResult.data, notificationSent },
    { status: 201 }
  )
}
