'use server'

import { cachedFetchAPI } from '@app/actions/fetchAPI'
import { TIME_REVALIDATE } from '@lib/constants'
import { PostsFetcherProps, PostsTagQueried } from '@lib/types'
import { query } from './query'

export const getTagPagePosts = async ({
  slug,
  cursor,
  qty
}: PostsFetcherProps): Promise<PostsTagQueried> => {
  const { posts } =
    (await cachedFetchAPI({
      revalidate: TIME_REVALIDATE.SIX_HOURS,
      query,
      variables: {
        slug,
        qty,
        endCursor: cursor
      }
    })) ?? {}
  return posts
}
