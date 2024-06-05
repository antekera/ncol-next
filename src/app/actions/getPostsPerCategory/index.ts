'use server'

import { unstable_cache as cache } from 'next/cache'

import { fetchAPI } from '@app/actions/fetchAPI'
import { PostsCategoryQueried } from '@lib/types'

import { query } from './query'

export const getPostsPerCategory = cache(
  async (slug: string, qty: number): Promise<PostsCategoryQueried> => {
    const data = await fetchAPI(query, {
      variables: {
        slug,
        qty
      }
    })
    return data?.posts
  },
  ['data-category'],
  {
    revalidate: 60 * 60 * 24 // 24 hours
  }
)
