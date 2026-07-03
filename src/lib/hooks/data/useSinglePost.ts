'use client'

import { useFetchAPI } from '@lib/hooks/data/useFetchAPI'
import { SinglePostResponse } from '@lib/types'
import { query } from '@app/actions/getPostAndMorePosts/query'

export function useSinglePost(slug: string, options?: any) {
  const { data, error, isLoading } = useFetchAPI<SinglePostResponse>(
    {
      query: query({
        isRevision: false
      }),
      variables: {
        id: slug,
        idType: 'URI'
      }
    },
    options
  )

  return {
    data,
    error,
    isLoading
  }
}
