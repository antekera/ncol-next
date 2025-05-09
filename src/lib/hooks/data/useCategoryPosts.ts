'use client'

import { useFetchAPI } from '@lib/hooks/data/useFetchAPI'
import { PostsCategoryQueried, PostsFetcherProps } from '@lib/types'
import { query } from '@app/actions/getCategoryPagePosts/query'

export function useCategoryPosts({ slug, qty, cursor }: PostsFetcherProps) {
  const { data, error, isLoading } = useFetchAPI<{
    posts: PostsCategoryQueried
  }>({
    query,
    variables: {
      slug,
      qty,
      endCursor: cursor,
      offset: 0
    }
  })

  return {
    data: data?.posts,
    error,
    isLoading
  }
}
