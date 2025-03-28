'use server'

import { cachedFetchAPI } from '@app/actions/fetchAPI'
import { TIME_REVALIDATE } from '@lib/constants'
import { HomePageQueried } from '@lib/types'
import { queryCover, queryLeft, queryRight } from './query'

export const getCoverPostForHome = async (
  name: string,
  qty: number
): Promise<HomePageQueried> => {
  const data = await cachedFetchAPI({
    revalidate: TIME_REVALIDATE.THREE_HOURS,
    query: queryCover,
    variables: {
      name,
      qty
    }
  })
  return data?.posts
}

export const getLeftPostsForHome = async (
  name: string,
  qty: number,
  endCursor: string
): Promise<HomePageQueried> => {
  const data = await cachedFetchAPI({
    revalidate: TIME_REVALIDATE.THREE_HOURS,
    query: queryLeft,
    variables: {
      name,
      qty,
      endCursor
    }
  })
  return data?.posts
}

export const getRightPostsForHome = async (
  name: string,
  qty: number,
  endCursor: string
): Promise<HomePageQueried> => {
  const data = await cachedFetchAPI({
    revalidate: TIME_REVALIDATE.THREE_HOURS,
    query: queryRight,
    variables: {
      name,
      qty,
      endCursor
    }
  })
  return data?.posts
}
