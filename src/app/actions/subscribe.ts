'use server'
import { z } from 'zod'

const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID
const API_KEY = process.env.MAILCHIMP_API_KEY
const API_SERVER = process.env.MAILCHIMP_API_SERVER

const invalidMessage = 'Email inválido.'
const errorMessage =
  'Hubo un error al intentar suscribirte, por favor intenta de nuevo.'
const successMessage =
  '¡Gracias por suscribirte! Te enviaremos un correo electrónico de confirmación.'

const schema = z.object({
  email: z.string().email().min(1)
})

export async function subscribe(_: unknown, formData: FormData) {
  const email = formData.get('email')
  const validatedFields = schema.safeParse({
    email: formData.get('email')
  })

  if (!validatedFields.success) {
    return {
      message: invalidMessage
    }
  }

  const url = `https://${API_SERVER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`

  try {
    const data = {
      email_address: email,
      status: 'pending'
    }
    const options = {
      body: JSON.stringify(data),
      headers: {
        Authorization: `api_key ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }

    const response = await fetch(url, options)

    if (response.status >= 400) {
      return {
        type: 'error',
        message: errorMessage
      }
    }
    return {
      type: 'success',
      message: successMessage
    }
  } catch (error) {
    return {
      type: error ?? 'error',
      message: errorMessage
    }
  }
}
