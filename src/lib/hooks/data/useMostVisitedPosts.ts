'use client'

import useSWR from 'swr'
import { fetcher } from '@lib/utils/utils'
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
  const { data, error, isLoading } = useSWR<MostVisitedApiResponse>(
    load ? query : null,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 10_000,
      refreshInterval: 60_000
    }
  )

  return {
    data,
    isLoading,
    error
  }
}
