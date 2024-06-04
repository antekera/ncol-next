'use server'

import { unstable_cache as cache } from 'next/cache'

import { fetchAPI } from '@app/actions/fetchAPI'
import { PostsCategoryQueried } from '@lib/types'

import { query } from './query'

export const getCategoryPagePosts = cache(
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
    revalidate: 3600 // 1 hour
  }
)
