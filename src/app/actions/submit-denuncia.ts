'use server'
import { Resend } from 'resend'
import * as Sentry from '@sentry/nextjs'
import { isProd } from '@lib/utils'

// Types
type FormState = {
  success: boolean
  message?: string
  error?: string
}

type MediaUploadResult = { id: number; source_url: string; mime_type: string }

/**
 * Uploads a single media file to the WordPress REST API.
 */
async function uploadMedia(
  file: File,
  wpUser: string,
  wpPassword: string,
  wpApiUrl: string
): Promise<MediaUploadResult | null> {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const auth = Buffer.from(`${wpUser}:${wpPassword}`).toString('base64')
    const response = await fetch(`${wpApiUrl}/wp/v2/media`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`
      },
      body: formData
    })

    if (!response.ok) {
      const text = await response.text()
      Sentry.captureMessage('Media upload failed', {
        level: 'error',
        extra: {
          status: response.status,
          statusText: response.statusText,
          responseBody: text
        }
      })
      return null
    }

    const data = await response.json()
    return {
      id: data.id,
      source_url: data.source_url,
      mime_type: data.mime_type
    }
  } catch (error) {
    Sentry.captureException(error, { tags: { action: 'uploadMedia' } })
    return null
  }
}

/**
 * Helper to verify Cloudflare Turnstile token.
 */
async function verifyTurnstile(
  token: string,
  secret: string
): Promise<boolean> {
  try {
    const captchaRes = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret,
          response: token
        })
      }
    ).then(res => res.json())

    return !!captchaRes.success
  } catch (err) {
    Sentry.captureException(err, { tags: { action: 'verifyTurnstile' } })
    return false
  }
}

/**
 * Sends an email notification about the new denuncia.
 */
async function sendNotificationEmail(
  resendApiKey: string,
  details: {
    title: string
    estado: string
    municipio: string
    parroquia: string
    sector: string
    contactName: string
    whatsapp: string
    isAnonymous: boolean
    description: string
    postId: number
  }
) {
  const {
    title,
    estado,
    municipio,
    parroquia,
    sector,
    contactName,
    whatsapp,
    isAnonymous,
    description,
    postId
  } = details
  try {
    const resend = new Resend(resendApiKey)
    await resend.emails.send({
      from: 'NoticiasCOL Denuncias <contacto@noticiascol.com>',
      to: ['prensa@noticiascol.com'],
      subject: `Nueva Denuncia Recibida: ${title}`,
      html: `
                <h1>Nueva Denuncia Recibida</h1>
                <p><strong>Título:</strong> ${title}</p>
                <p><strong>Ubicación:</strong> ${estado}, ${municipio}, ${parroquia}, ${sector}</p>
                <p><strong>Contacto:</strong> ${contactName} (${whatsapp})</p>
                <p><strong>Anonimato:</strong> ${isAnonymous ? 'Sí' : 'No'}</p>
                <hr />
                <p><strong>Descripción:</strong></p>
                <p>${description}</p>
                <hr />
                <p>Se ha creado un borrador en WordPress (ID: ${postId}).</p>
                <p><a href="https://admin.noticiascol.com/wp-admin/post.php?post=${postId}&action=edit">Revisar en WordPress</a></p>
            `
    })
  } catch (emailError) {
    Sentry.captureException(emailError, {
      tags: { action: 'sendEmailNotification' }
    })
  }
}

/**
 * Process all media files and identify featured image.
 */
async function processMedia(
  mediaFiles: File[],
  wpUser: string,
  wpPassword: string,
  wpApiUrl: string
) {
  const uploadedMedia: MediaUploadResult[] = []
  let featuredImageUrl = ''

  for (const file of mediaFiles) {
    if (file.size > 0) {
      const uploaded = await uploadMedia(file, wpUser, wpPassword, wpApiUrl)
      if (uploaded) {
        uploadedMedia.push(uploaded)
        if (!featuredImageUrl && file.type.startsWith('image/')) {
          featuredImageUrl = uploaded.source_url
        }
      }
    }
  }
  return { uploadedMedia, featuredImageUrl }
}

export async function submitDenuncia(formData: FormData): Promise<FormState> {
  // 1. Setup Config
  const wpUser = process.env.WP_USER?.trim()
  const wpPassword = process.env.WP_PASSWORD?.trim()
  const resendApiKey = process.env.RESEND_API_KEY?.trim()
  const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY?.trim()
  const wpApiUrl = String(
    process.env.NEXT_PUBLIC_WORDPRESS_JSON_URL || ''
  ).trim()

  if (!wpUser || !wpPassword)
    return { success: false, error: 'Error de configuración.' }

  // 2. Extract Data
  const title = formData.get('title') as string
  const estado = formData.get('estado') as string
  const municipio = formData.get('municipio') as string
  const parroquia = formData.get('parroquia') as string
  const sector = formData.get('sector') as string
  const description = formData.get('description') as string
  const contactName = formData.get('contactName') as string
  const whatsapp = formData.get('whatsapp') as string
  const isAnonymous = formData.get('anonymous') !== 'on'
  const mediaFiles = formData.getAll('media') as File[]
  const token = formData.get('token') as string

  // 3. Validation
  if (
    !title ||
    !description ||
    !estado ||
    !municipio ||
    !parroquia ||
    !sector ||
    !contactName ||
    !whatsapp
  ) {
    return { success: false, error: 'Campos obligatorios faltantes.' }
  }

  if (isProd) {
    if (!token || !turnstileSecretKey)
      return { success: false, error: 'Falta verificación.' }
    const isHuman = await verifyTurnstile(token, turnstileSecretKey)
    if (!isHuman) return { success: false, error: 'Error de verificación.' }
  }

  try {
    // 4. Media & Content
    const { uploadedMedia, featuredImageUrl } = await processMedia(
      mediaFiles,
      wpUser,
      wpPassword,
      wpApiUrl
    )

    const additionalMediaHtml = uploadedMedia
      .filter(m => m.source_url !== featuredImageUrl)
      .map(m => {
        if (m.mime_type.startsWith('video/')) {
          return `<video controls class="alignnone size-full" style="width: 100%; max-width: 100%; height: auto;"><source src="${m.source_url}" type="${m.mime_type}">Tu navegador no soporta el elemento de video.</video>`
        }
        return `<img class="alignnone size-full wp-image-${m.id}" src="${m.source_url}" alt="Denuncia: ${title}" />`
      })
      .join('\n')

    const originalContent =
      `
            Denuncia: ${title}
            Descripción: ${description}
            Ubicación:
            Estado: ${estado}
            Municipio: ${municipio}
            Parroquia: ${parroquia}
            Sector: ${sector}
            Contacto: ${contactName} (WhatsApp: ${whatsapp})
            Desea anonimato: ${isAnonymous ? 'Sí' : 'No'}
        `.trim() +
      (additionalMediaHtml
        ? `\n\nArchivos multimedia adicionales:\n${additionalMediaHtml}`
        : '')

    // 5. WordPress Request
    const auth = Buffer.from(`${wpUser}:${wpPassword}`).toString('base64')
    const payload = {
      title: `Denuncia: ${title}`,
      content: originalContent,
      category_id: 3216,
      source_id: 'canal-denuncias',
      featured_image_url: featuredImageUrl,
      acf: {
        contenido_original: originalContent,
        fuente_noticia:
          'Denuncia enviada por la comunidad a través del <a href="https://noticiascol.com/denuncias/">canal de denuncias</a>.'
      }
    }

    const response = await fetch(`${wpApiUrl}/ai-scraper/v1/posts/draft/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      Sentry.captureMessage('Draft failed', {
        extra: { status: response.status, payload }
      })
      return { success: false, error: 'Error del servidor.' }
    }

    const data = await response.json()
    const postId = data.post_id

    // 6. Post-processing
    if (postId) {
      Promise.all(
        uploadedMedia.map(m =>
          fetch(`${wpApiUrl}/wp/v2/media/${m.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Basic ${auth}`
            },
            body: JSON.stringify({ post: postId })
          })
        )
      ).catch(err => Sentry.captureException(err))

      if (resendApiKey) {
        await sendNotificationEmail(resendApiKey, {
          title,
          estado,
          municipio,
          parroquia,
          sector,
          contactName,
          whatsapp,
          isAnonymous,
          description,
          postId
        })
      }
    }

    return { success: true, message: 'Enviada correctamente.' }
  } catch (error) {
    Sentry.captureException(error)
    return { success: false, error: 'Error inesperado.' }
  }
}
