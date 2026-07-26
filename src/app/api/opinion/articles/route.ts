import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

import { createClient } from '@lib/supabase/server'

const requestSchema = z.object({
  token: z.string().min(24).max(255),
  title: z.string().trim().min(5).max(180),
  content: z.string().min(20).max(100_000),
  acceptedTerms: z.literal(true),
  termsVersion: z.string().min(1).max(40)
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ message: 'Debes iniciar sesión.' }, { status: 401 })
  }

  let input: z.infer<typeof requestSchema>
  try {
    input = requestSchema.parse(await request.json())
  } catch (error) {
    return NextResponse.json(
      { message: 'Revisa el título, contenido y aceptación de términos.' },
      { status: 400 }
    )
  }

  const endpoint = process.env.WORDPRESS_OPINION_API_URL
  const username = process.env.WORDPRESS_OPINION_API_USERNAME
  const password = process.env.WORDPRESS_OPINION_API_PASSWORD

  if (!endpoint || !username || !password) {
    Sentry.captureMessage('Opinion WordPress API is not configured')
    return NextResponse.json(
      { message: 'El servicio de publicación no está configurado.' },
      { status: 503 }
    )
  }

  try {
    const acceptedAt = new Date().toISOString()
    const wordpressResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: input.title,
        content: input.content,
        authorToken: input.token,
        termsVersion: input.termsVersion,
        acceptedAt,
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
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'Opinión NoticiasCol <contacto@noticiascol.com>',
        to: process.env.OPINION_NOTIFICATION_EMAIL ?? 'prensa@noticiascol.com',
        subject: `Nuevo artículo de Opinión: ${input.title}`,
        text: [
          `Autor: ${result.post.author.name}`,
          `Título: ${input.title}`,
          `Publicado: ${result.post.publishedAt}`,
          `URL: ${result.post.url}`,
          `Usuario Supabase: ${user.id}`
        ].join('\n')
      })
      notificationSent = true
    } catch (error) {
      Sentry.captureException(error)
    }

    return NextResponse.json(
      { ...result, notificationSent },
      { status: 201 }
    )
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json(
      { message: 'Ocurrió un error al publicar el artículo.' },
      { status: 500 }
    )
  }
}
