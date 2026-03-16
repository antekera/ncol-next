'use server'

import { unstable_cache } from 'next/cache'
import * as Sentry from '@sentry/nextjs'
import { TIME_REVALIDATE } from '@lib/constants'
import { HttpClient } from '@lib/httpClient'
import { log } from '@logtail/next'

const client = new HttpClient()
const API_URL = (process.env.WORDPRESS_API_URL ?? '').trim()

export interface FetchAPIProps {
  query: string
  revalidate?: number
  variables?: Record<string, any>
  enabled?: boolean
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
    const response = await client.post<T>(API_URL, body)

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
  const { revalidate = TIME_REVALIDATE.DAY } = props
  return unstable_cache(
    async () => fetchAPI<T>(props),
    [JSON.stringify(props)],
    {
      revalidate
    }
  )()
}
