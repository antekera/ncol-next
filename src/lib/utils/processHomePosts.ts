import { HomePageQueried, PostHome } from '@lib/types'
import { isPostPublishedWithinLastDay } from '@lib/utils/isPostPublishedWithinLastDay'

interface ProcessedPosts {
  cover?: PostHome
}

type PostEdge = { node?: PostHome }

export const processHomePosts = (
  posts?: HomePageQueried['left'],
  mostVisitedSlug?: string | null
): ProcessedPosts => {
  const edges = posts?.edges ?? []

  // 1. Try find noticiadestacada === true in COL_LEFT published within last 24h
  const noticiadestacadaPost = edges.find((edge: PostEdge) => {
    const post = edge.node
    return (
      post?.customFields?.noticiadestacada === true &&
      isPostPublishedWithinLastDay(post)
    )
  })?.node

  if (noticiadestacadaPost) {
    return { cover: noticiadestacadaPost }
  }

  // 2. Try find most visited post in COL_LEFT
  if (mostVisitedSlug) {
    const mostVisitedPostFromLeft = edges.find((edge: PostEdge) => {
      const post = edge.node
      return post?.slug === mostVisitedSlug || post?.uri === mostVisitedSlug
    })?.node

    if (
      mostVisitedPostFromLeft &&
      isPostPublishedWithinLastDay(mostVisitedPostFromLeft)
    ) {
      return { cover: mostVisitedPostFromLeft }
    }
  }

  // 3. Fallback: first post IF fresh
  const firstPost = edges[0]?.node
  if (firstPost && isPostPublishedWithinLastDay(firstPost)) {
    return { cover: firstPost }
  }

  return { cover: undefined }
}
