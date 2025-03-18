'use server'

import { log } from '@logtail/next'

import { HttpClient } from '@lib/httpClient'
const client = new HttpClient()

const API_URL = process.env.WORDPRESS_API_URL as string
const FETCH_ERROR = 'FETCH_ERROR: '
const FETCH_SUCCESS = 'FETCH_SUCCESS: '
const RETRY_DELAY = 1000 // 1 second delay before retry
const MAX_RETRIES = 2

export async function fetchAPI({
  query,
  revalidate,
  variables = {}
}: {
  query: string
  revalidate?: number
  variables?: Record<string, unknown>
}) {
  const headers: Record<string, string> = {}

  if (process.env.WORDPRESS_AUTH_REFRESH_TOKEN) {
    headers.Authorization = `Bearer ${process.env.WORDPRESS_AUTH_REFRESH_TOKEN}`
  }

  const body = { query, variables }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { data } = await client.post(API_URL, body, {
        headers,
        revalidate
      })
      log.info(`🚀🚀🚀 ${FETCH_SUCCESS} 🚀🚀🚀`)
      return data
    } catch (error) {
      if (attempt === 1) {
        log.warn(`Attempt ${attempt} failed, retrying...`, {
          response: JSON.stringify(error)
        })
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
        continue
      }

      log.error(`🚨🚨🚨 ${FETCH_ERROR} 🚨🚨🚨`, {
        response: JSON.stringify(error),
        variables,
        body: JSON.stringify(body)
      })
      throw error // Re-throw the error after final attempt
    }
  }
}
