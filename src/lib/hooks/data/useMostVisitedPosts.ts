'use client'

import { useSessionSWR } from '@lib/hooks/useSessionSWR'
import { MostVisitedApiResponse } from '@lib/types'

export const useMostVisitedPosts = ({
  load,
  limit,
  days
}: {
  load: boolean
  limit?: number
  days?: number
}) => {
  let query = '/api/most-visited/'
  const params = new URLSearchParams()
  if (limit) {
    params.append('limit', String(limit))
  }
  if (days) {
    params.append('days', String(days))
  }
  const queryString = params.toString()
  if (queryString) {
    query = `${query}?${queryString}`
  }

  // Generate a unique storage key based on the query parameters
  const storageKey = `most_visited_nonce_${limit ?? 'all'}_${days ?? 'all'}`

  const { data, error, isLoading } = useSessionSWR<MostVisitedApiResponse>(
    load ? query : null,
    storageKey
  )

  return {
    data,
    isLoading,
    error
  }
}
