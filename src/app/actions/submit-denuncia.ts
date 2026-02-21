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
    contactEmail?: string
    isAnonymous: boolean
    details: string
    involved: string
    timeline: string
    actions: string
    solution: string
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
    contactEmail,
    isAnonymous,
    details: detailsText,
    involved,
    timeline,
    actions,
    solution,
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
                <p><strong>Contacto:</strong> ${contactName} (${whatsapp}) ${contactEmail ? ` - ${contactEmail}` : ''}</p>
                <p><strong>Anonimato:</strong> ${isAnonymous ? 'Sí' : 'No'}</p>
                <hr />
                <h3>Detalles de la Denuncia:</h3>
                <p><strong>1. ¿Qué ocurrió?:</strong><br/>${detailsText}</p>
                <p><strong>2. Afectados/Responsables:</strong><br/>${involved}</p>
                <p><strong>3. Tiempo/Frecuencia:</strong><br/>${timeline}</p>
                <p><strong>4. Denuncias previas:</strong><br/>${actions}</p>
                <p><strong>5. Sugerencia/Solución:</strong><br/>${solution}</p>
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

/**
 * Formats the complaint content into a structured report.
 */
function formatComplaintContent(details: {
  title: string
  estado: string
  municipio: string
  parroquia: string
  sector: string
  contactName: string
  whatsapp: string
  contactEmail?: string
  isAnonymous: boolean
  detailsField: string
  involved: string
  timeline: string
  actions: string
  solution: string
  additionalMediaHtml: string
}) {
  const {
    title,
    estado,
    municipio,
    parroquia,
    sector,
    contactName,
    whatsapp,
    contactEmail,
    isAnonymous,
    detailsField,
    involved,
    timeline,
    actions,
    solution,
    additionalMediaHtml
  } = details

  return (
    `
            Denuncia: ${title}
            Ubicación: ${estado}, ${municipio}, ${parroquia}, ${sector}
            Contacto: ${contactName} (WhatsApp: ${whatsapp}${contactEmail ? `, Email: ${contactEmail}` : ''})
            Desea anonimato: ${isAnonymous ? 'Sí' : 'No'}
            
            1. ¿Qué ocurrió?:
            ${detailsField}

            2. Afectados o responsables:
            ${involved}

            3. Tiempo/Frecuencia:
            ${timeline}

            4. Denuncias previas:
            ${actions}

            5. Solución esperada:
            ${solution}
        `.trim() +
    (additionalMediaHtml
      ? `\n\nArchivos multimedia adicionales:\n${additionalMediaHtml}`
      : '')
  )
}

/**
 * Validates the required fields and media.
 */
function validateDenuncia(data: Record<string, unknown>, mediaFiles: File[]) {
  const requiredFields = [
    'title',
    'details',
    'involved',
    'timeline',
    'actions',
    'solution',
    'estado',
    'municipio',
    'parroquia',
    'sector',
    'contactName',
    'whatsapp'
  ]

  for (const field of requiredFields) {
    if (!data[field])
      return { valid: false, error: 'Campos obligatorios faltantes.' }
  }

  if (
    mediaFiles.length === 0 ||
    (mediaFiles.length === 1 && mediaFiles[0].size === 0)
  ) {
    return { valid: false, error: 'Debes subir al menos una foto o video.' }
  }

  return { valid: true }
}

/**
 * Creates a draft post in WordPress using the provided details.
 */
async function createWordPressDraft(details: {
  wpApiUrl: string
  auth: string
  payload: unknown
}) {
  const { wpApiUrl, auth, payload } = details
  const response = await fetch(`${wpApiUrl}/ai-scraper/v1/posts/draft/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    return { success: false, status: response.status }
  }

  const data = await response.json()
  return { success: true, post_id: data.post_id }
}

/**
 * Handles post-submission tasks like linking media to the post and sending notification emails.
 */
async function handlePostProcessing(details: {
  postId: number
  uploadedMedia: MediaUploadResult[]
  wpApiUrl: string
  auth: string
  resendApiKey?: string
  complaintData: {
    title: string
    estado: string
    municipio: string
    parroquia: string
    sector: string
    contactName: string
    whatsapp: string
    contactEmail?: string
    isAnonymous: boolean
    detailsField: string
    involved: string
    timeline: string
    actions: string
    solution: string
  }
}) {
  const { postId, uploadedMedia, wpApiUrl, auth, resendApiKey, complaintData } =
    details

  // Link media to post in background
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

  // Send notification email
  if (resendApiKey) {
    await sendNotificationEmail(resendApiKey, {
      ...complaintData,
      details: complaintData.detailsField,
      postId
    })
  }
}

/**
 * Loads and verifies the required environment variables.
 */
function getDenunciaConfig() {
  const wpUser = process.env.WP_USER?.trim()
  const wpPassword = process.env.WP_PASSWORD?.trim()
  const resendApiKey = process.env.RESEND_API_KEY?.trim()
  const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY?.trim()
  const wpApiUrl = String(
    process.env.NEXT_PUBLIC_WORDPRESS_JSON_URL || ''
  ).trim()

  return { wpUser, wpPassword, resendApiKey, turnstileSecretKey, wpApiUrl }
}

export async function submitDenuncia(formData: FormData): Promise<FormState> {
  // 1. Setup Config
  const { wpUser, wpPassword, resendApiKey, turnstileSecretKey, wpApiUrl } =
    getDenunciaConfig()

  if (!wpUser || !wpPassword)
    return { success: false, error: 'Error de configuración.' }

  // 2. Extract Data
  const title = formData.get('title') as string
  const estado = formData.get('estado') as string
  const municipio = formData.get('municipio') as string
  const parroquia = formData.get('parroquia') as string
  const sector = formData.get('sector') as string
  const detailsField = formData.get('details') as string
  const involved = formData.get('involved') as string
  const timeline = formData.get('timeline') as string
  const actions = formData.get('actions') as string
  const solution = formData.get('solution') as string
  const contactName = formData.get('contactName') as string
  const whatsapp = formData.get('whatsapp') as string
  const contactEmail = formData.get('contactEmail') as string
  const isAnonymous = formData.get('anonymous') !== 'on'
  const mediaFiles = formData.getAll('media') as File[]
  const token = formData.get('token') as string

  // 3. Validation
  const validation = validateDenuncia(
    Object.fromEntries(formData.entries()),
    mediaFiles
  )
  if (!validation.valid) return { success: false, error: validation.error }

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

    const originalContent = formatComplaintContent({
      title,
      estado,
      municipio,
      parroquia,
      sector,
      contactName,
      whatsapp,
      isAnonymous,
      detailsField,
      involved,
      timeline,
      actions,
      solution,
      additionalMediaHtml
    })

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

    const draftResult = await createWordPressDraft({ wpApiUrl, auth, payload })

    if (!draftResult.success) {
      Sentry.captureMessage('Draft failed', {
        extra: { status: draftResult.status, payload }
      })
      return { success: false, error: 'Error del servidor.' }
    }

    const postId = draftResult.post_id

    // 6. Post-processing
    if (postId) {
      await handlePostProcessing({
        postId,
        uploadedMedia,
        wpApiUrl,
        auth,
        resendApiKey,
        complaintData: {
          title,
          estado,
          municipio,
          parroquia,
          sector,
          contactName,
          whatsapp,
          contactEmail,
          isAnonymous,
          detailsField,
          involved,
          timeline,
          actions,
          solution
        }
      })
    }

    return { success: true, message: 'Enviada correctamente.' }
  } catch (error) {
    Sentry.captureException(error)
    return { success: false, error: 'Error inesperado.' }
  }
}
