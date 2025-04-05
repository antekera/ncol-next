'use client'

import { useFetchAPI } from '@lib/hooks/data/useFetchAPI'
import { HomePageQueried, PostsFetcherProps } from '@lib/types'
import { query } from '@app/actions/getCategoryPagePosts/query'

export function useHomeLeftPosts({
  slug,
  qty,
  cursor,
  offset,
  enabled
}: PostsFetcherProps) {
  const { data, error, isLoading } = useFetchAPI<{
    posts: HomePageQueried['left']
  }>({
    query,
    variables: {
      slug,
      qty,
      endCursor: cursor,
      offset: offset ?? 0
    },
    enabled
  })

  return {
    data: data?.posts,
    error,
    isLoading
  }
}
