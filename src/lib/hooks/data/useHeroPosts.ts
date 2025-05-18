'use client'

import { useFetchAPI } from '@lib/hooks/data/useFetchAPI'
import { HomePageQueried, PostsFetcherProps } from '@lib/types'
import { query } from '@app/actions/getCategoryPagePosts/query'

export function useHeroPosts({ slug, qty }: PostsFetcherProps) {
  const { data, error, isLoading } = useFetchAPI<{
    posts: HomePageQueried['left']
  }>({
    query,
    variables: {
      slug,
      qty,
      offset: 0
    }
  })

  return {
    data: data?.posts,
    error,
    isLoading
  }
}
