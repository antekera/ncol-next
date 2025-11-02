import { HomePageQueried, PostHome } from '@lib/types'
import { isPostPublishedWithinLastDay } from '@lib/utils/isPostPublishedWithinLastDay'

interface ProcessedPosts {
  cover?: PostHome
}

type TagEdge = { node?: { slug?: string } }
type PostEdge = { node?: { tags?: { edges?: TagEdge[] } } }

export const processHomePosts = (
  posts?: HomePageQueried['left']
): ProcessedPosts => {
  const coverPost = posts?.edges.filter((edge: PostEdge) => {
    const tags: TagEdge[] = edge.node?.tags?.edges ?? []
    return tags.some(tag => tag.node?.slug === 'en-portada')
  })?.[0]?.node
  const fallbackPost = posts?.edges?.[0]?.node
  const cover = isPostPublishedWithinLastDay(coverPost)
    ? coverPost
    : fallbackPost
  return {
    cover
  }
}
