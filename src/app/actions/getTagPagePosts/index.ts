'use server'

import { cachedFetchAPI } from '@app/actions/fetchAPI'
import { log } from '@logtail/next'
import { TIME_REVALIDATE } from '@lib/constants'
import { PostsTagQueried } from '@lib/types'
import { query } from './query'

export const getTagPagePosts = async (
  slug: string,
  qty: number,
  endCursor: string
): Promise<PostsTagQueried> => {
  const { posts } =
    (await cachedFetchAPI({
      revalidate: TIME_REVALIDATE.SIX_HOURS,
      query,
      variables: {
        slug,
        qty,
        endCursor
      }
    })) ?? {}
  log.info(`GET_TAG_PAGE_POSTS: ${slug}`)
  return posts
}
