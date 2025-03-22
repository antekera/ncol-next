'use server'

import { log } from '@logtail/next'
import * as Sentry from '@sentry/nextjs'

import { HttpClient } from '@lib/httpClient'
const client = new HttpClient()

const API_URL = process.env.WORDPRESS_API_URL as string
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
      return data
    } catch (error) {
      if (attempt === 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
        continue
      }
      if (attempt === MAX_RETRIES) {
        log.error(`Attempt ${attempt} failed, no more retries`, {
          response: JSON.stringify(error)
        })
        Sentry.captureException(error)
        Sentry.captureMessage(
          `Error fetching API after ${MAX_RETRIES} attempts`,
          {
            level: 'error'
          }
        )
      }
      throw error // Re-throw the error after final attempt
    }
  }
}
