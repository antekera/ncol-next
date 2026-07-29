'use client'

import { clientFetchAPI, useFetchAPI } from '@lib/hooks/data/useFetchAPI'
import { PostsFetcherProps, PostsCategoryQueried } from '@lib/types'
import { queryAuthorPosts } from '@app/actions/getAuthorData/query'

export function useAuthorPosts({
  slug,
  qty,
  offset
}: Omit<PostsFetcherProps, 'slug'> & { slug: string }) {
  const { data, error, isLoading, mutate } = useFetchAPI<{
    posts: PostsCategoryQueried
  }>({
    query: queryAuthorPosts,
    variables: { authorName: slug, qty, offset: offset ?? 0 }
  })

  const fetchMorePosts = async (currentOffset: number) => {
    const newData = await clientFetchAPI<{ posts: PostsCategoryQueried }>({
      query: queryAuthorPosts,
      variables: { authorName: slug, qty, offset: currentOffset }
    })

    if (!newData) return null

    await mutate(currentData => {
      if (!currentData) return newData
      return {
        posts: {
          ...currentData.posts,
          edges: [...currentData.posts.edges, ...(newData.posts?.edges ?? [])]
        }
      }
    }, false)

    return newData
  }

  return { data: data?.posts, error, isLoading, fetchMorePosts }
}
