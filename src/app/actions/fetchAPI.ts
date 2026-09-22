'use server'

import { unstable_cache } from 'next/cache'
import * as Sentry from '@sentry/nextjs'
import { TIME_REVALIDATE } from '@lib/constants'
import { HttpClient } from '@lib/httpClient'
import { log } from '@logtail/next'

const client = new HttpClient()
// The GraphQL endpoint is public by design. Prefer the server-only setting,
// but retain the public endpoint as a fallback so server renders do not lose
// their data when a local or preview environment omits the private alias.
const API_URL = (
  process.env.WORDPRESS_API_URL ||
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
  ''
).trim()

export interface FetchAPIProps {
  query: string
  revalidate?: number
  variables?: Record<string, any>
  enabled?: boolean
  tags?: string[]
}

export async function fetchAPI<T = any>({
  query,
  variables = {}
}: FetchAPIProps): Promise<T | null> {
  if (!API_URL) {
    log.error('WORDPRESS_API_URL is not defined')
    return null
  }

  try {
    const body = { query, variables }
    const response = await client.post<T>(API_URL, body, { revalidate: 0 })

    if (response.error || !response.data) {
      log.error('fetchAPI Failed', {
        status: response.status,
        error: response.error?.message,
        query: query.substring(0, 100)
      })
      return null
    }

    const result = response.data as any
    if (result?.errors) {
      log.error('fetchAPI GraphQL Errors', {
        errors: result.errors,
        query: query.substring(0, 100)
      })
    }

    return result?.data ?? null
  } catch (error) {
    Sentry.captureException(error)
    return null
  }
}

export const cachedFetchAPI = async <T = any>(
  props: FetchAPIProps
): Promise<T | null> => {
  const { revalidate = TIME_REVALIDATE.DAY, tags = [] } = props
  return unstable_cache(
    async () => fetchAPI<T>(props),
    [JSON.stringify(props)],
    {
      revalidate,
      tags
    }
  )()
}
