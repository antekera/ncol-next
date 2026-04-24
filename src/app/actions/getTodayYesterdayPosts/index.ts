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
    type: string
    className?: string
    slice?: number
  }
  customFields?: {
    videodestacado?: string
  }
}

export interface TodayPostsResult {
  edges: { node: TodayPost }[]
}

function getThreeDaysAgoDateStringInCaracas(): string {
  // America/Caracas is UTC-4 (no DST)
  const now = new Date()
  const caracasMs = now.getTime() - (now.getTimezoneOffset() + 240) * 60000
  const caracasNow = new Date(caracasMs)
  const threeDaysAgo = new Date(caracasNow)
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  return threeDaysAgo.toISOString().split('T')[0] ?? '' // "YYYY-MM-DD"
}

export async function getTodayYesterdayPosts({
  slug
}: {
  slug: string
}): Promise<TodayPostsResult | null> {
  const yesterdayDate = getThreeDaysAgoDateStringInCaracas()

  const data = await cachedFetchAPI<{ posts: TodayPostsResult }>({
    query: queryTodayYesterdayPosts,
    variables: { slug },
    revalidate: TIME_REVALIDATE.HOUR
  })

  if (!data?.posts) return null

  // Filter to only posts from today or yesterday (Caracas time)
  const filteredEdges = data.posts.edges.filter(({ node }) => {
    const postDate = node.date.split('T')[0]
    return postDate !== undefined && postDate >= yesterdayDate
  })

  return { edges: filteredEdges }
}
