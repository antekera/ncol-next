'use client'

import useSWRImmutable from 'swr/immutable'
import { fetcher } from '@lib/utils/utils'
import { MostVisitedApiResponse } from '@lib/types'

interface Props {
  limit?: number
  period?: '24h' | 'weekly' | 'monthly'
}

export const useMostVisitedPosts = ({ limit, period }: Props) => {
  let query = '/api/most-visited/'
  const params = new URLSearchParams()
  if (limit) {
    params.append('limit', limit.toString())
  }
  if (period) {
    params.append('period', period)
  }

  if (params.toString()) {
    query += `?${params.toString()}`
  }
  const { data, error, isLoading } = useSWRImmutable<MostVisitedApiResponse>(
    query,
    fetcher
  )

  return {
    data,
    isLoading,
    error
  }
}
