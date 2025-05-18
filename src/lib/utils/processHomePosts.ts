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
  // eslint-disable-next-line sonarjs/pseudo-random
  const randomPost = posts?.edges?.[Math.floor(Math.random() * 5)]?.node

  return {
    cover: isPostPublishedWithinLastDay(coverPost) ? coverPost : randomPost
  }
}
