'use server'

import { fetchAPI } from '@app/actions/fetchAPI'
import { TIME_REVALIDATE } from '@lib/constants'
import { HomePageQueried } from '@lib/types'

import { queryCover, queryLeft, queryRight } from './query'

export const getCoverPostForHome = async (
  name: string,
  qty: number
): Promise<HomePageQueried> => {
  const data = await fetchAPI({
    revalidate: TIME_REVALIDATE.DAY,
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
  qty: number
): Promise<HomePageQueried> => {
  const data = await fetchAPI({
    revalidate: TIME_REVALIDATE.DAY,
    query: queryLeft,
    variables: {
      name,
      qty
    }
  })
  return data?.posts
}

export const getRightPostsForHome = async (
  name: string,
  qty: number
): Promise<HomePageQueried> => {
  const data = await fetchAPI({
    revalidate: TIME_REVALIDATE.DAY,
    query: queryRight,
    variables: {
      name,
      qty
    }
  })
  return data?.posts
}
