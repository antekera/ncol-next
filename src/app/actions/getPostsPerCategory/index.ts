'use server'

import { unstable_cache as cache } from 'next/cache'

import { fetchAPI } from '@app/actions/fetchAPI'
import { PostsCategoryQueried } from '@lib/types'

import { query, querySingle } from './query'

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
  ['data-category']
)

export const getPostsPerCategorySingle = cache(
  async (slug: string, qty: number): Promise<PostsCategoryQueried> => {
    const data = await fetchAPI(querySingle, {
      variables: {
        slug,
        qty
      }
    })
    return data?.posts
  },
  ['data-category-single']
)
