'use client'

import useSWR from 'swr'
import type { FetchAPIProps } from '@app/actions/fetchAPI'
import { HttpClient } from '@lib/httpClient'
import * as Sentry from '@sentry/nextjs'

const client = new HttpClient()
const API_URL = '/api/graphql'

export async function clientFetchAPI<T = any>({
  query,
  variables = {}
}: FetchAPIProps): Promise<T | null> {
  try {
    const body = { query, variables }
    const response = await client.post<{ data: T }>(API_URL, body)

    if (response.error || !response.data) {
      return null
    }

    return response.data.data ?? null
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
