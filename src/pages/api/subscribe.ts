import type { NextApiRequest, NextApiResponse } from 'next'

const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID
const API_KEY = process.env.MAILCHIMP_API_KEY
const API_SERVER = process.env.MAILCHIMP_API_SERVER

interface ResponseData {
  message?: string
  error?: string
}

const subscribe = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const { email } = req.body

  if (!email || email.length === 0) {
    return res.status(400).json({ error: 'Email is required' })
  }

  const url = `https://${API_SERVER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`
  const errorMessage = 'Error'
  const successMessage = 'Success'

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
      return res.status(400).json({
        error: errorMessage
      })
    }
    return res.status(201).json({ message: successMessage, error: undefined })
  } catch (error) {
    return res.status(500).json({ error: errorMessage, message: errorMessage })
  }
}

export default subscribe
