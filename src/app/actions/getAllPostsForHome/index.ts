'use server'

import { cachedFetchAPI } from '@app/actions/fetchAPI'
import { TIME_REVALIDATE } from '@lib/constants'
import {
  HomePageQueried,
  LeftHomePageQueried,
  PostsFetcherProps,
  PostsHomeFetcherProps
} from '@lib/types'
import { query, queryLeft } from './query'

export const getHomePosts = async ({
  coverSlug,
  leftSlug,
  rightSlug,
  qty,
  leftCursor,
  rightCursor
}: PostsHomeFetcherProps): Promise<HomePageQueried> => {
  const data = await cachedFetchAPI({
    revalidate: TIME_REVALIDATE.THREE_HOURS,
    query,
    variables: {
      coverSlug,
      leftSlug,
      rightSlug,
      qty,
      leftCursor,
      rightCursor
    }
  })
  return data
}

export const getLeftPostsForHome = async ({
  slug,
  qty,
  cursor
}: PostsFetcherProps): Promise<LeftHomePageQueried> => {
  const data = await cachedFetchAPI({
    revalidate: TIME_REVALIDATE.SIX_HOURS,
    query: queryLeft,
    variables: {
      name: slug,
      qty,
      endCursor: cursor
    }
  })
  return data?.posts
}
