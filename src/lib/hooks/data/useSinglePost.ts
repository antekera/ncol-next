'use client'

import { useFetchAPI } from '@lib/hooks/data/useFetchAPI'
import { PostsMorePosts } from '@lib/types'
import { query } from '@app/actions/getPostAndMorePosts/query'
import { getMainWordFromSlug } from '@lib/utils'

export function useSinglePost(slug: string) {
  const { data, error, isLoading } = useFetchAPI<PostsMorePosts>({
    query: query({
      isRevision: false,
      relatedSearch: getMainWordFromSlug(slug) ?? 'cabimas'
    }),
    variables: {
      id: slug,
      idType: 'SLUG'
    }
  })

  return {
    data,
    error,
    isLoading
  }
}
