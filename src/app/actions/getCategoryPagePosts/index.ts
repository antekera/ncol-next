'use server'

import { cachedFetchAPI } from '@app/actions/fetchAPI'
import { TIME_REVALIDATE } from '@lib/constants'
import { PostsCategoryQueried, PostsFetcherProps } from '@lib/types'
import { query } from './query'

export const getCategoryPagePosts = async ({
  slug,
  qty,
  cursor
}: PostsFetcherProps): Promise<PostsCategoryQueried> => {
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
