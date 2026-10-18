'use client'

import useSWR from 'swr'
import { MostVisitedApiResponse } from '@lib/types'
import {
  prepareRankingPosts,
  type HomeRankingPost
} from '@lib/homeV2/rankingIdentity'

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
  const { data, error, isLoading } = useSWR<{ posts: HomeRankingPost[] }>(
    load ? `most-visited-${limit}-${days}` : null,
    async () => {
      const response = await fetch(
        `/api/most-visited?limit=${limit}&days=${days}`
      )
      if (!response.ok) {
        throw new Error(`Most visited request failed with ${response.status}`)
      }
      const result = (await response.json()) as MostVisitedApiResponse
      return { ...result, posts: await prepareRankingPosts(result.posts) }
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
