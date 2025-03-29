'use server'

import { cachedFetchAPI } from '@app/actions/fetchAPI'
import { TIME_REVALIDATE } from '@lib/constants'
import { HomePageQueried, PostsFetcherProps } from '@lib/types'
import { queryCover, queryLeft, queryRight } from './query'

export const getCoverPostForHome = async ({
  slug,
  qty
}: PostsFetcherProps): Promise<HomePageQueried> => {
  const data = await cachedFetchAPI({
    revalidate: TIME_REVALIDATE.THREE_HOURS,
    query: queryCover,
    variables: {
      name: slug,
      qty
    }
  })
  return data?.posts
}

export const getLeftPostsForHome = async ({
  slug,
  qty,
  cursor
}: PostsFetcherProps): Promise<HomePageQueried> => {
  const data = await cachedFetchAPI({
    revalidate: TIME_REVALIDATE.THREE_HOURS,
    query: queryLeft,
    variables: {
      name: slug,
      qty,
      endCursor: cursor
    }
  })
  return data?.posts
}

export const getRightPostsForHome = async ({
  slug,
  qty,
  cursor
}: PostsFetcherProps): Promise<HomePageQueried> => {
  const data = await cachedFetchAPI({
    revalidate: TIME_REVALIDATE.THREE_HOURS,
    query: queryRight,
    variables: {
      name: slug,
      qty,
      endCursor: cursor
    }
  })
  return data?.posts
}
