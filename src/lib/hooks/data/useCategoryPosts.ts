'use client'

import { clientFetchAPI, useFetchAPI } from '@lib/hooks/data/useFetchAPI'
import { PostsCategoryQueried, PostsFetcherProps } from '@lib/types'
import { query } from '@app/actions/getCategoryPagePosts/query'

export function useCategoryPosts({
  slug,
  qty,
  initialQty,
  offset,
  enabled
}: PostsFetcherProps) {
  const { data, error, isLoading, mutate } = useFetchAPI<{
    posts: PostsCategoryQueried
  }>({
    query,
    variables: {
      slug,
      qty: initialQty ?? qty,
      offset: offset ?? 0,
      content: true
    },
    enabled
  })

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
