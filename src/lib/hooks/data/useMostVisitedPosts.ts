'use client'

import useSWR from 'swr'
import { MostVisitedApiResponse } from '@lib/types'

const DEFAULT_LIMIT = 5
const DEFAULT_DAYS = 7

export const useMostVisitedPosts = ({
  load,
  limit = DEFAULT_LIMIT,
  days = DEFAULT_DAYS
}: {
  load: boolean
  limit?: number
  days?: number
}) => {
  const { data, error, isLoading } = useSWR<MostVisitedApiResponse>(
    load ? `most-visited-${limit}-${days}` : null,
    async () => {
      const response = await fetch(
        `/api/most-visited?limit=${limit}&days=${days}`
      )
      if (!response.ok) {
        throw new Error(`Most visited request failed with ${response.status}`)
      }
      return (await response.json()) as MostVisitedApiResponse
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60 * 60 * 1000,
      keepPreviousData: true
    }
  )

  return { data, isLoading, error }
}
