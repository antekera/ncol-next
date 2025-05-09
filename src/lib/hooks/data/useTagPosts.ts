'use client'

import { useFetchAPI } from '@lib/hooks/data/useFetchAPI'
import { PostsFetcherProps, PostsTagQueried } from '@lib/types'
import { query } from '@app/actions/getTagPagePosts/query'

export function useTagPosts({ slug, qty, cursor }: PostsFetcherProps) {
  const { data, error, isLoading } = useFetchAPI<{
    posts: PostsTagQueried
  }>({
    query,
    variables: {
      slug,
      qty,
      endCursor: cursor
    }
  })

  return {
    data: data?.posts,
    error,
    isLoading
  }
}
