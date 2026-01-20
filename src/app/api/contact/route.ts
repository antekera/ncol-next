import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { isProd } from '@lib/utils'
import * as Sentry from '@sentry/nextjs'

const resend = new Resend(process.env.RESEND_API_KEY)

const DOMAIN_NAME = 'noticiascol.com'

const subjectToEmail: Record<string, string> = {
  'notas-de-prensa': `prensa@${DOMAIN_NAME}`,
  'notas-patrocinadas': `publicidad@${DOMAIN_NAME}`,
  publicidad: `publicidad@${DOMAIN_NAME}`,
  otro: `prensa@${DOMAIN_NAME}`
}

export async function POST(req: Request) {
  let name, email, subject, message, token

  try {
    const body = await req.json()
    name = body.name
    email = body.email
    subject = body.subject
    message = body.message
    token = body.token
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
  }

  if (!name || !email || !subject || !message || (isProd && !token)) {
    return NextResponse.json({ message: 'Faltan datos.' }, { status: 400 })
  }

  if ((isProd && !token) || !name || !email || !subject || !message) {
    return NextResponse.json({ message: 'Faltan datos.' }, { status: 400 })
  }

  if (isProd) {
    const captcha = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY!,
          response: token
        })
      }
    ).then(res => res.json())

    if (!captcha.success) {
      return NextResponse.json(
        { message: 'Error de validación humana.' },
        { status: 403 }
      )
    }
  }

  const to =
    subject && Object.prototype.hasOwnProperty.call(subjectToEmail, subject)
      ? subjectToEmail[subject as keyof typeof subjectToEmail]
      : `prensa@${DOMAIN_NAME}`

  try {
    await resend.emails.send({
      from: `Contacto <contacto@${DOMAIN_NAME}>`,
      to,
      subject: `Nuevo mensaje de contacto: ${subject}`,
      replyTo: email,
      text: `Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`
    })

    return NextResponse.json({ message: 'Mensaje enviado exitosamente.' })
  } catch (err: any) {
    Sentry.captureException(err)
    return NextResponse.json(
      { message: 'Error al enviar correo.' },
      { status: 500 }
    )
  }
}
