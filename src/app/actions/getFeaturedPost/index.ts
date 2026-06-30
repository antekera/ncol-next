'use server'

import { cachedFetchAPI } from '@app/actions/fetchAPI'
import { CATEGORIES, TIME_REVALIDATE } from '@lib/constants'
import { PostHome } from '@lib/types'
import { queryRecentFromCategory } from './query'

interface PostsResult {
  posts: {
    edges: { node: PostHome }[]
  }
}

export async function getFeaturedPost(): Promise<PostHome | null> {
  const data = await cachedFetchAPI<PostsResult>({
    query: queryRecentFromCategory,
    variables: { slug: CATEGORIES.COL_LEFT, qty: 10 },
    revalidate: TIME_REVALIDATE.HOUR,
    tags: ['homepage', 'featured-post']
  })

  const edges = data?.posts?.edges ?? []
  if (edges.length === 0) return null

  const destacada = edges.find(
    e => e.node?.customFields?.noticiadestacada === true
  )?.node

  return destacada ?? edges[0]?.node ?? null
}
