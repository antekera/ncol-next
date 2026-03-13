'use server'

import { cache } from 'react'
import * as Sentry from '@sentry/nextjs'
import { TIME_REVALIDATE } from '@lib/constants'
import { HttpClient } from '@lib/httpClient'
import { log } from '@logtail/next'

const client = new HttpClient()
const API_URL = (process.env.WORDPRESS_API_URL ?? '').trim()

if (!API_URL) {
  log.error('WORDPRESS_API_URL is not defined')
}

export interface FetchAPIProps {
  query: string
  revalidate?: number
  variables?: Record<string, any>
  enabled?: boolean
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

  // Set Origin and Referer for server-side requests (Node.js doesn't add them automatically)
  const origin = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'
  headers.Origin = origin
  headers.Referer = `${origin}/`

  // Add secret header for GraphQL Origin Guard
  if (process.env.WORDPRESS_GRAPHQL_SECRET) {
    headers['X-NCOL-ORIGIN'] = process.env.WORDPRESS_GRAPHQL_SECRET
  }

  const body = { query, variables }

  if (!API_URL) {
    throw new Error('WORDPRESS_API_URL is invalid or missing')
  }

  try {
    const { data } = await client.post(API_URL, body, {
      headers,
      revalidate
    })
    return data
  } catch (error) {
    // Add breadcrumb for debugging but don't capture exception here
    // to avoid double reporting (the caller handles it)
    Sentry.addBreadcrumb({
      category: 'api',
      message: `GraphQL Query Failed: ${query.substring(0, 50)}...`,
      data: {
        url: API_URL,
        variables: JSON.stringify(variables).substring(0, 500)
      },
      level: 'error'
    })

    // Re-throw to propagate to callers
    throw error
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
