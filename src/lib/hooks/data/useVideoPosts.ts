'use client'

import { useFetchAPI } from '@lib/hooks/data/useFetchAPI'
import { PostHome } from '@lib/types'
import { queryVideoPosts } from '@app/actions/getVideoPosts/query'
import { getEmbedUrl } from '@lib/utils/video'

interface VideoPostsResult {
  posts: {
    edges: { node: PostHome }[]
  }
}

const VIDEO_POSTS_MAX_AGE_DAYS = 30

export function useVideoPosts({
  enabled = true,
  filterByDate = true
}: {
  enabled?: boolean
  filterByDate?: boolean
} = {}) {
  const { data, error, isLoading } = useFetchAPI<VideoPostsResult>({
    query: queryVideoPosts,
    enabled
  })

  // Keep older videos available instead of limiting the feed to the last week.
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - VIDEO_POSTS_MAX_AGE_DAYS)

  const posts = data?.posts?.edges
    ? data.posts.edges
        .map(edge => edge.node)
        .filter(node => {
          const url = node.customFields?.videodestacado
          const hasVideo = url && url.trim() !== '' && getEmbedUrl(url) !== null
          if (!hasVideo) return false

          // Filter by date if enabled
          if (filterByDate) {
            if (node.date) {
              const postDate = new Date(node.date)
              return postDate >= cutoffDate
            }
            return false
          }
          return true
        })
    : []

  return {
    posts,
    error,
    isLoading: isLoading || (enabled && !data && !error)
  }
}
