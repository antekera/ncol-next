import { LeftHomePageQueried, PostHome } from '@lib/types'
import { isPostPublishedWithinLastDay } from '@lib/utils/isPostPublishedWithinLastDay'

interface ProcessedPosts {
  cover: PostHome | undefined
  posts?: LeftHomePageQueried['edges']
}

export const processHomePosts = (
  posts: LeftHomePageQueried
): ProcessedPosts => {
  const coverPost = posts.edges?.find(
    post =>
      post?.node?.tags?.edges?.some(tag => tag?.node?.name === 'en-portada') &&
      isPostPublishedWithinLastDay(post?.node)
  )?.node

  const cover = coverPost ?? posts?.edges?.[0]?.node

  return {
    cover
  }
}
