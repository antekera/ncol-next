'use server'

import { cachedFetchAPI } from '@app/actions/fetchAPI'
import { CATEGORIES, TIME_REVALIDATE } from '@lib/constants'
import { PostHome } from '@lib/types'
import { queryFeaturedPost, queryLatestFromCategory } from './query'

interface PostsResult {
  posts: {
    edges: { node: PostHome }[]
  }
}

export async function getFeaturedPost(): Promise<PostHome | null> {
  // 1. Try to find a post with post_destacado = true
  const featuredData = await cachedFetchAPI<PostsResult>({
    query: queryFeaturedPost,
    revalidate: TIME_REVALIDATE.HOUR
  })

  const featuredPost = featuredData?.posts?.edges?.[0]?.node ?? null

  if (featuredPost) {
    return featuredPost
  }

  // 2. Fallback: most recent post from the left column category
  const fallbackData = await cachedFetchAPI<PostsResult>({
    query: queryLatestFromCategory,
    variables: { slug: CATEGORIES.COL_LEFT },
    revalidate: TIME_REVALIDATE.HOUR
  })

  return fallbackData?.posts?.edges?.[0]?.node ?? null
}
