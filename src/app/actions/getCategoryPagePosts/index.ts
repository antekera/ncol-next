'use server'

import { fetchAPI } from '@app/actions/fetchAPI'
import { log } from '@logtail/next'
import { TIME_REVALIDATE } from '@lib/constants'
import { PostsCategoryQueried } from '@lib/types'
import { query } from './query'

export const getCategoryPagePosts = async (
  slug: string,
  qty: number,
  endCursor: string
): Promise<PostsCategoryQueried> => {
  const { posts } =
    (await fetchAPI({
      revalidate: TIME_REVALIDATE.THREE_HOURS,
      query,
      variables: {
        slug,
        qty,
        endCursor
      }
    })) ?? {}
  log.info(`GET_CATEGORY_PAGE_POSTS: ${slug}`)
  return posts
}
