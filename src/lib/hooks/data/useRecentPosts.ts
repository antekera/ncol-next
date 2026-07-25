'use client'

import { clientFetchAPI, useFetchAPI } from '@lib/hooks/data/useFetchAPI'
import { PostsFetcherProps, PostsQueried } from '@lib/types'
import { query } from '@app/actions/getRecentPosts/query'
import type { SWRConfiguration } from 'swr'

export function useRecentPosts(
  { qty, initialQty, offset, enabled }: Omit<PostsFetcherProps, 'slug'>,
  options?: SWRConfiguration<{ posts: PostsQueried }>
) {
  const { data, error, isLoading, mutate } = useFetchAPI<{
    posts: PostsQueried
  }>(
    {
      query,
      variables: {
        qty: initialQty ?? qty,
        offset: offset ?? 0
      },
      enabled
    },
    options
  )

  const fetchMorePosts = async (currentOffset: number) => {
    const newData = await clientFetchAPI<{
      posts: PostsQueried
    }>({
      query,
      variables: {
        qty,
        offset: currentOffset
      }
    })

    await mutate(currentData => {
      if (!currentData || !newData) return currentData

      const existingIds = new Set(currentData.posts.edges.map(e => e.node.id))
      const dedupedNew = newData.posts.edges.filter(
        e => !existingIds.has(e.node.id)
      )

      return {
        posts: {
          ...currentData.posts,
          edges: [...currentData.posts.edges, ...dedupedNew]
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
