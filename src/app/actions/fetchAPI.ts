'use server'

import { log } from '@logtail/next'

import { HttpClient } from '@lib/httpClient'
const client = new HttpClient()

const API_URL = process.env.WORDPRESS_API_URL as string
const FETCH_ERROR = 'FETCH_ERROR: '
const FETCH_SUCCESS = 'FETCH_SUCCESS: '

export async function fetchAPI({
  query,
  revalidate,
  variables = {}
}: {
  query: string
  revalidate: number
  variables?: Record<string, unknown>
}) {
  const headers: Record<string, string> = {}

  if (process.env.WORDPRESS_AUTH_REFRESH_TOKEN) {
    headers.Authorization = `Bearer ${process.env.WORDPRESS_AUTH_REFRESH_TOKEN}`
  }

  const body = { query, variables }

  try {
    const { data } = await client.post(API_URL, body, {
      headers,
      revalidate
    })
    log.info(`🚀🚀🚀 ${FETCH_SUCCESS} 🚀🚀🚀`, {
      data: Object.keys(data),
      body: Object.keys(body)
    })
    return data
  } catch (error) {
    log.error(`🚨🚨🚨 ${FETCH_ERROR} 🚨🚨🚨`, {
      response: JSON.stringify(error),
      variables,
      body: JSON.stringify(body)
    })
  }
}
