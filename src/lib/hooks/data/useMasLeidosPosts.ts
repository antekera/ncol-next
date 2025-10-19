'use client'

import useSWRImmutable from 'swr/immutable'
import { fetcher } from '@lib/utils/utils'
import { MostVisitedApiResponse } from '@lib/types'

export const useMasLeidosPosts = () => {
  const query = '/api/most-visited?limit=10'
  const { data, error, isLoading } = useSWRImmutable<MostVisitedApiResponse>(
    query,
    fetcher
  )

  return {
    data,
    isLoading,
    error,
  }
}