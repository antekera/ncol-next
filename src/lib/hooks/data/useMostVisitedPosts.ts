'use client'

import useSWRImmutable from 'swr/immutable'
import { fetcher } from '@lib/utils/utils'
import { MostVisitedApiResponse } from '@lib/types'

export const useMostVisitedPosts = (load: boolean) => {
  const query = '/api/most-visited/'
  const { data, error, isLoading } = useSWRImmutable<MostVisitedApiResponse>(
    load ? query : null,
    fetcher
  )

  return {
    data,
    isLoading,
    error
  }
}
