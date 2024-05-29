'use server'

import { HttpClient } from '@lib/httpClient'
const client = new HttpClient()

const API_URL = process.env.WORDPRESS_API_URL
const FETCH_ERROR = 'FETCH_ERROR: '

export async function fetchAPI(query, { variables } = {}) {
  const headers = {}

  if (process.env.WORDPRESS_AUTH_REFRESH_TOKEN) {
    headers['Authorization'] =
      `Bearer ${process.env.WORDPRESS_AUTH_REFRESH_TOKEN}`
  }

  const body = { query, variables }

  try {
    const { data } = await client.post(API_URL, body, { headers })
    return data
  } catch (error) {
    throw new Error({
      code: 'FETCH_ERROR',
      message: FETCH_ERROR + error.message
    })
  }
}
