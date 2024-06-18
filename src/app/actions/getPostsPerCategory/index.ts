'use server'

import { unstable_cache as cache } from 'next/cache'

import { fetchAPI } from '@app/actions/fetchAPI'
import { TIME_REVALIDATE } from '@lib/constants'
import { PostsCategoryQueried } from '@lib/types'

import { query, querySingle } from './query'

export const getPostsPerCategory = cache(
  async (slug: string, qty: number): Promise<PostsCategoryQueried> => {
    const data = await fetchAPI({
      revalidate: TIME_REVALIDATE.DAY,
      query,
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
    const data = await fetchAPI({
      revalidate: TIME_REVALIDATE.DAY,
      query: querySingle,
      variables: {
        slug,
        qty
      }
    })
    return data?.posts
  },
  ['data-category-single']
)
