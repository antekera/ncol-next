'use client'

import { clientFetchAPI, useFetchAPI } from '@lib/hooks/data/useFetchAPI'
import { PostsFetcherProps, PostsTagQueried } from '@lib/types'
import { query } from '@app/actions/getTagPagePosts/query'

export function useTagPosts({ slug, qty, offset }: PostsFetcherProps) {
  const { data, error, isLoading, mutate } = useFetchAPI<{
    posts: PostsTagQueried
  }>({
    query,
    variables: {
      slug,
      qty,
      offset: offset ?? 0
    }
  })

  const fetchMorePosts = async (currentOffset: number) => {
    const newData = await clientFetchAPI({
      query,
      variables: {
        slug,
        qty,
        offset: currentOffset
      }
    })

    await mutate(currentData => {
      if (!currentData) return newData
      return {
        posts: {
          ...currentData.posts,
          edges: [...currentData.posts.edges, ...newData.posts.edges]
        }
      }
    }, false)

    return newData
  }

  return {
    data: data?.posts,
    error,
    isLoading,
    fetchMorePosts
  }
}
