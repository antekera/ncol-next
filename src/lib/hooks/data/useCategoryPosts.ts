'use client'

import { clientFetchAPI, useFetchAPI } from '@lib/hooks/data/useFetchAPI'
import { PostsCategoryQueried, PostsFetcherProps } from '@lib/types'
import { query } from '@app/actions/getCategoryPagePosts/query'

export function useCategoryPosts(
  { slug, qty, initialQty, offset, enabled }: PostsFetcherProps,
  options?: any
) {
  const { data, error, isLoading, mutate } = useFetchAPI<{
    posts: PostsCategoryQueried
  }>(
    {
      query,
      variables: {
        slug,
        qty: initialQty ?? qty,
        offset: offset ?? 0,
        content: true
      },
      enabled
    },
    options
  )

  const fetchMorePosts = async (currentOffset: number) => {
    const newData = await clientFetchAPI<{
      posts: PostsCategoryQueried
    }>({
      query,
      variables: {
        slug,
        qty,
        offset: currentOffset,
        content: true
      }
    })

    await mutate(currentData => {
      const existingData = currentData ?? data
      if (!existingData || !newData) return existingData

      const existingIds = new Set(existingData.posts.edges.map(e => e.node.id))
      const dedupedNew = newData.posts.edges.filter(
        e => !existingIds.has(e.node.id)
      )

      return {
        posts: {
          ...existingData.posts,
          edges: [...existingData.posts.edges, ...dedupedNew]
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
