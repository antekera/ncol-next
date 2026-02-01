'use client'

import { useFetchAPI } from '@lib/hooks/data/useFetchAPI'
import { RelatedPosts } from '@lib/types'
import { queryRelatedPosts } from '@app/actions/getPostAndMorePosts/query'
import { getMainWordFromSlug } from '@lib/utils'

export function useRelatedPosts({
  slug,
  enabled,
  categoryName
}: {
  slug: string
  enabled: boolean
  categoryName?: string
}) {
  const { data, error, isLoading } = useFetchAPI<RelatedPosts>({
    query: queryRelatedPosts,
    variables: {
      categoryName: categoryName || undefined,
      search: categoryName ? undefined : getMainWordFromSlug(slug) || 'noticias'
    },
    enabled
  })

  return {
    data: data?.posts?.edges,
    error,
    isLoading
  }
}
