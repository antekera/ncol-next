'use server'

import { log } from '@logtail/next'
import { unstable_cache as cache } from 'next/cache'

import { fetchAPI } from '@app/actions/fetchAPI'
import { TIME_REVALIDATE } from '@lib/constants'
import { PostsCategoryQueried } from '@lib/types'

import { query } from './query'

export const getCategoryPagePosts = cache(
  async (
    slug: string,
    qty: number,
    endCursor: string
  ): Promise<PostsCategoryQueried> => {
    // eslint-disable-next-line no-console
    console.log(`GETCATEGORYPAGEPOSTS`, {
      slug,
      qty,
      endCursor
    })
    log.info(`GETCATEGORYPAGEPOSTS`, {
      slug,
      qty,
      endCursor
    })
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
    log.info(`POSTS_FETCH`, {
      posts
    })
    // eslint-disable-next-line no-console
    console.log(`POSTS_FETCH_2`, {
      posts
    })
    return posts
  },
  ['data-category'],
  {
    revalidate: 21600 // 6 hours
  }
)
