import { HomePageQueried, PostHome } from '@lib/types'
import { isPostPublishedWithinLastDay } from '@lib/utils/isPostPublishedWithinLastDay'

interface ProcessedPosts {
  cover?: PostHome
}

export const processHomePosts = (
  posts?: HomePageQueried['left']
): ProcessedPosts => {
  const coverPost = posts?.edges.filter((edge: any) => {
    const tags = edge.node?.tags?.edges ?? []
    return tags.some((tag: any) => tag.node?.slug === 'en-portada')
  })?.[0]?.node
  const fallbackPost = posts?.edges?.[0]?.node
  const cover = isPostPublishedWithinLastDay(coverPost)
    ? coverPost
    : fallbackPost
  return {
    cover
  }
}
