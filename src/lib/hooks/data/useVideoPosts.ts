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

  // Get date 7 days ago
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

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
              return postDate >= sevenDaysAgo
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
