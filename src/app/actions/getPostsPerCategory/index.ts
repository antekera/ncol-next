'use server'

import { fetchAPI } from '@app/actions/fetchAPI'
import { TIME_REVALIDATE } from '@lib/constants'
import { PostsCategoryQueried } from '@lib/types'

import { query, querySingle } from './query'

export const getPostsPerCategory = async (
  slug: string,
  qty: number
): Promise<PostsCategoryQueried> => {
  const data = await fetchAPI({
    revalidate: TIME_REVALIDATE.DAY,
    query,
    variables: {
      slug,
      qty
    }
  })
  return data?.posts
}

export const getPostsPerCategorySingle = async (
  slug: string,
  qty: number
): Promise<PostsCategoryQueried> => {
  const data = await fetchAPI({
    revalidate: TIME_REVALIDATE.DAY,
    query: querySingle,
    variables: {
      slug,
      qty
    }
  })
  return data?.posts
}
