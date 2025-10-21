'use client'

import useSWRImmutable from 'swr/immutable'
import { fetcher } from '@lib/utils/utils'
import { MostVisitedApiResponse } from '@lib/types'

export const useMasVistoAhoraPosts = () => {
  const query = '/api/most-visto-ahora/?limit=10'
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
