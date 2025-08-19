'use client'

import useSWRImmutable from 'swr/immutable'
import type { FetchAPIProps } from '@app/actions/fetchAPI'
import { HttpClient } from '@lib/httpClient'
import * as Sentry from '@sentry/nextjs'

const client = new HttpClient()
const API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL as string

export async function clientFetchAPI({ query, variables = {} }: FetchAPIProps) {
  try {
    const body = { query, variables }
    const { data } = await client.post(API_URL, body)
    return data
  } catch (error) {
    Sentry.captureException(error)
    Sentry.captureMessage(`Error fetching API  query: ${query}`, {
      level: 'error'
    })
  }
}

export function useFetchAPI<T>({
  query,
  variables,
  enabled = true
}: Omit<FetchAPIProps, 'revalidate'>) {
  return useSWRImmutable<T>(
    enabled ? [query, JSON.stringify(variables)] : null,
    async () => {
      const data = await clientFetchAPI({ query, variables, enabled })
      return data
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  )
}
