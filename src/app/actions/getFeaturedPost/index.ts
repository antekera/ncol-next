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
    revalidate: TIME_REVALIDATE.DAY,
    tags: ['homepage', 'featured-post']
  })

  const edges = data?.posts?.edges ?? []
  if (edges.length === 0) return null

  const destacada = edges.find(
    e => e.node?.customFields?.noticiadestacada === true
  )?.node

  const fallback = edges[0]?.node ?? null
  if (!destacada) return fallback

  // If the featured post is older than the newest post, the flag is stale — prefer the newer one
  const destacadaTime = destacada.date ? new Date(destacada.date).getTime() : 0
  const fallbackTime = fallback?.date ? new Date(fallback.date).getTime() : 0
  return destacadaTime >= fallbackTime ? destacada : fallback
}
