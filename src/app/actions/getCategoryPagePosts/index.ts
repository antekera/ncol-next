'use server'

import { log } from '@logtail/next'

import { fetchAPI } from '@app/actions/fetchAPI'
import { TIME_REVALIDATE } from '@lib/constants'
import { PostsCategoryQueried } from '@lib/types'

import { query } from './query'

export const getCategoryPagePosts = async (
  slug: string,
  qty: number,
  endCursor: string
): Promise<PostsCategoryQueried> => {
  // eslint-disable-next-line no-console
  const { posts } =
    (await fetchAPI({
      revalidate: TIME_REVALIDATE.DAY,
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
