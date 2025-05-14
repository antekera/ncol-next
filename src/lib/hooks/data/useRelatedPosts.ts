'use client'

import { useFetchAPI } from '@lib/hooks/data/useFetchAPI'
import { RelatedPosts } from '@lib/types'
import { queryRelatedPosts } from '@app/actions/getPostAndMorePosts/query'
import { getMainWordFromSlug } from '@lib/utils'

export function useRelatedPosts({
  slug,
  enabled
}: {
  slug: string
  enabled: boolean
}) {
  const { data, error, isLoading } = useFetchAPI<RelatedPosts>({
    query: queryRelatedPosts,
    variables: {
      search: getMainWordFromSlug(slug) ?? 'cabimas'
    },
    enabled
  })

  return {
    data: data?.posts?.edges,
    error,
    isLoading
  }
}
