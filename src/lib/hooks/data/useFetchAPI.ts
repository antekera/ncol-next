'use client'

import useSWR from 'swr'
import type { FetchAPIProps } from '@app/actions/fetchAPI'
import { HttpClient } from '@lib/httpClient'
import * as Sentry from '@sentry/nextjs'

const client = new HttpClient()
const API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL as string

export async function clientFetchAPI<T = any>({
  query,
  variables = {}
}: FetchAPIProps): Promise<T | null> {
  try {
    const body = { query, variables }
    const response = await client.post<T>(API_URL, body)

    if (response.error || !response.data) {
      return null
    }

    const result = response.data as any
    if (result?.errors) {
      Sentry.captureException(new Error('GraphQL Errors'), {
        extra: { errors: result.errors, query: query.substring(0, 100) }
      })
    }

    return result?.data ?? null
  } catch (error) {
    Sentry.captureException(error)
    return null
  }
}

export function useFetchAPI<T>(
  { query, variables, enabled = true }: Omit<FetchAPIProps, 'revalidate'>,
  options?: any
) {
  return useSWR<T>(
    enabled ? [query, JSON.stringify(variables)] : null,
    async () => {
      const data = await clientFetchAPI<T>({ query, variables, enabled })
      return data as T
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      ...options
    }
  )
}
