'use server'

import { unstable_cache as cache } from 'next/cache'

import { fetchAPI } from '@app/actions/fetchAPI'
import { PostsCategoryQueried } from '@lib/types'

import { query } from './query'

export const getCategoryPagePosts = cache(
  async (
    slug: string,
    qty: number,
    endCursor: string
  ): Promise<PostsCategoryQueried> => {
    const { posts } =
      (await fetchAPI(query, {
        variables: {
          slug,
          qty,
          endCursor
        }
      })) ?? {}

    return posts
  },
  ['data-category']
)
