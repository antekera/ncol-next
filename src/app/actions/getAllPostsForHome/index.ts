'use server'

import { unstable_cache as cache } from 'next/cache'

import { fetchAPI } from '@app/actions/fetchAPI'
import { TIME_REVALIDATE } from '@lib/constants'
import { HomePageQueried } from '@lib/types'

import { queryCover, queryLeft, queryRight } from './query'

export const getCoverPostForHome = cache(
  async (name: string, qty: number): Promise<HomePageQueried> => {
    const data = await fetchAPI({
      revalidate: TIME_REVALIDATE.DAY,
      query: queryCover,
      variables: {
        name,
        qty
      }
    })
    return data?.posts
  },
  ['data-home-cover']
)

export const getLeftPostsForHome = cache(
  async (name: string, qty: number): Promise<HomePageQueried> => {
    const data = await fetchAPI({
      revalidate: TIME_REVALIDATE.DAY,
      query: queryLeft,
      variables: {
        name,
        qty
      }
    })
    return data?.posts
  },
  ['data-home-left']
)

export const getRightPostsForHome = cache(
  async (name: string, qty: number): Promise<HomePageQueried> => {
    const data = await fetchAPI({
      revalidate: TIME_REVALIDATE.DAY,
      query: queryRight,
      variables: {
        name,
        qty
      }
    })
    return data?.posts
  },
  ['data-home-right']
)
