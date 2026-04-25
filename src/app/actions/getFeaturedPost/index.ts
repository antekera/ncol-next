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
  const [featuredData, fallbackData] = await Promise.all([
    cachedFetchAPI<PostsResult>({
      query: queryFeaturedPost,
      revalidate: TIME_REVALIDATE.HOUR
    }),
    cachedFetchAPI<PostsResult>({
      query: queryLatestFromCategory,
      variables: { slug: CATEGORIES.COL_LEFT },
      revalidate: TIME_REVALIDATE.HOUR
    })
  ])

  const featuredPost = featuredData?.posts?.edges?.[0]?.node ?? null
  const fallbackPost = fallbackData?.posts?.edges?.[0]?.node ?? null

  if (featuredPost && fallbackPost && featuredPost.date && fallbackPost.date) {
    const featuredDate = featuredPost.date.split('T')[0] || ''
    const fallbackDate = fallbackPost.date.split('T')[0] || ''

    if (featuredDate < fallbackDate) {
      return fallbackPost
    }

    return featuredPost
  }

  return featuredPost || fallbackPost
}
