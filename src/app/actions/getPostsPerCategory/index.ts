'use server'

import { cachedFetchAPI } from '@app/actions/fetchAPI'
import { TIME_REVALIDATE } from '@lib/constants'
import { PostsCategoryQueried, PostsFetcherProps } from '@lib/types'
import { query, querySingle } from './query'

export const getPostsPerCategory = async ({
  slug,
  qty
}: PostsFetcherProps): Promise<PostsCategoryQueried> => {
  const data = await cachedFetchAPI({
    revalidate: TIME_REVALIDATE.SIX_HOURS,
    query,
    variables: {
      slug,
      qty
    }
  })
  return data?.posts
}

export const getPostsPerCategorySingle = async ({
  slug,
  qty
}: PostsFetcherProps): Promise<PostsCategoryQueried> => {
  const data = await cachedFetchAPI({
    revalidate: TIME_REVALIDATE.WEEK,
    query: querySingle,
    variables: {
      slug,
      qty
    }
  })
  return data?.posts
}
