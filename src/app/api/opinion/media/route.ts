import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

import { OpinionClient } from '@lib/api/OpinionClient'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024

export async function POST(request: Request) {
  const endpoint = process.env.WORDPRESS_OPINION_API_URL
  const secret = process.env.WORDPRESS_OPINION_API_SECRET
  if (!endpoint || !secret) {
    return NextResponse.json(
      { message: 'El servicio no está configurado.' },
      { status: 503 }
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json(
      { message: 'Solicitud inválida.' },
      { status: 400 }
    )
  }

  const token = formData.get('token')
  if (typeof token !== 'string' || token.length < 8 || token.length > 255) {
    return NextResponse.json(
      { message: 'Token de autor faltante o inválido.' },
      { status: 401 }
    )
  }

  const authorInfo = await new OpinionClient().getAuthorInfo(token)
  if (!authorInfo.ok) {
    return NextResponse.json(
      { message: 'Token de autor inválido o no autorizado.' },
      { status: 401 }
    )
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json(
      { message: 'No se recibió ningún archivo.' },
      { status: 400 }
    )
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { message: 'Solo se aceptan imágenes JPEG, PNG o WebP.' },
      { status: 415 }
    )
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { message: 'La imagen no puede superar 5 MB.' },
      { status: 413 }
    )
  }

  const mediaEndpoint = endpoint.replace(/\/articles$/, '/media')
  const upstream = new FormData()
  upstream.append('file', file)

  try {
    const res = await fetch(mediaEndpoint, {
      method: 'POST',
      headers: { 'X-Opinion-Secret': secret },
      body: upstream
    })

    const data = (await res.json()) as {
      id?: number
      url?: string
      message?: string
    }

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message ?? 'No se pudo subir la imagen.' },
        { status: res.status }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    Sentry.captureException(err)
    return NextResponse.json(
      { message: 'Error al subir la imagen.' },
      { status: 500 }
    )
  }
}
