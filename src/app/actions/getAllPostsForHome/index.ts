'use server'

import { cachedFetchAPI } from '@app/actions/fetchAPI'
import { TIME_REVALIDATE } from '@lib/constants'
import {
  HomePageQueried,
  LeftHomePageQueried,
  PostsFetcherProps
} from '@lib/types'
import { query, queryLeft } from './query'

export const getHomePosts = async ({
  slug,
  qty,
  cursor
}: PostsFetcherProps): Promise<HomePageQueried['cover']> => {
  const data = await cachedFetchAPI({
    revalidate: TIME_REVALIDATE.HOUR,
    query,
    variables: {
      name: slug,
      qty,
      endCursor: cursor
    }
  })
  return data?.posts
}

export const getLeftPostsForHome = async ({
  slug,
  qty,
  cursor
}: PostsFetcherProps): Promise<LeftHomePageQueried> => {
  const data = await cachedFetchAPI({
    revalidate: TIME_REVALIDATE.HOUR,
    query: queryLeft,
    variables: {
      name: slug,
      qty,
      endCursor: cursor
    }
  })
  return data?.posts
}
