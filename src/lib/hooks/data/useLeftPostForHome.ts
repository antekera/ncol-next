'use client'

import { useFetchAPI } from '@lib/hooks/data/useFetchAPI'
import { LeftHomePageQueried, PostsFetcherProps } from '@lib/types'
import { queryLeft } from '@app/actions/getAllPostsForHome/query'

export function useCategoryPosts({ slug, qty, cursor }: PostsFetcherProps) {
  const { data, error } = useFetchAPI<{ posts: LeftHomePageQueried }>({
    query: queryLeft,
    variables: {
      name: slug,
      qty,
      endCursor: cursor
    }
  })

  return {
    data: data?.posts,
    error
  }
}
