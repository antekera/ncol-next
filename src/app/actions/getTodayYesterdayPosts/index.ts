'use server'

import { cachedFetchAPI } from '@app/actions/fetchAPI'
import { TIME_REVALIDATE } from '@lib/constants'
import { queryTodayYesterdayPosts } from './query'

export interface TodayPost {
  id: string
  title: string
  uri: string
  date: string
  excerpt?: string
  featuredImage?: {
    node: {
      sourceUrl: string
      srcSet?: string
      mediaDetails?: {
        width: number
        height: number
      }
    }
  }
  categories: {
    edges: {
      node: {
        name: string
        slug: string
        parentId?: string | null
      }
    }[]
  }
  customFields?: {
    videodestacado?: string
  }
}

export interface TodayPostsResult {
  edges: { node: TodayPost }[]
}

function getRecentCutoffDateInCaracas(): string {
  // America/Caracas is UTC-4 (no DST).
  // Use 3 days as the cutoff so slow news days (e.g. weekends) don't produce
  // an empty module. Posts older than 3 days are excluded by the filter below.
  const cutoff = new Date()
  cutoff.setUTCDate(cutoff.getUTCDate() - 3)
  // Format in Caracas time directly, independent of host timezone.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Caracas',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(cutoff) // "YYYY-MM-DD"
}

export async function getTodayYesterdayPosts({
  slug
}: {
  slug: string
}): Promise<TodayPostsResult | null> {
  const recentCutoff = getRecentCutoffDateInCaracas()

  const data = await cachedFetchAPI<{ posts: TodayPostsResult }>({
    query: queryTodayYesterdayPosts,
    variables: { slug },
    revalidate: TIME_REVALIDATE.HOUR
  })

  if (!data?.posts) return null

  // Filter to only posts within the recent cutoff window (Caracas time)
  const filteredEdges = data.posts.edges.filter(({ node }) => {
    const postDate = node.date.split('T')[0]
    return postDate !== undefined && postDate >= recentCutoff
  })

  return { edges: filteredEdges }
}
