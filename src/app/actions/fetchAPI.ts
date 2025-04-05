'use server'

import { cache } from 'react'
import * as Sentry from '@sentry/nextjs'
import { TIME_REVALIDATE } from '@lib/constants'
import { HttpClient } from '@lib/httpClient'

const client = new HttpClient()
const API_URL = process.env.WORDPRESS_API_URL as string

export interface FetchAPIProps {
  query: string
  revalidate?: number
  variables?: Record<string, any>
}

export async function fetchAPI({
  query,
  revalidate,
  variables = {}
}: FetchAPIProps) {
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
    return data
  } catch (error) {
    Sentry.captureException(error)
    Sentry.captureMessage(`Error fetching API  query: ${query}`, {
      level: 'error'
    })
  }
}

export const cachedFetchAPI = cache(
  async ({ query, variables, revalidate }: FetchAPIProps) => {
    return fetchAPI({
      revalidate: revalidate ?? TIME_REVALIDATE.DAY,
      query,
      variables
    })
  }
)
