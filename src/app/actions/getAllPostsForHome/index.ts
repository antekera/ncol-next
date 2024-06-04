'use server'

import { unstable_cache as cache } from 'next/cache'

import { fetchAPI } from '@app/actions/fetchAPI'
import { HomePageQueried } from '@lib/types'

import { query } from './query'

export const getPostsForHome = cache(
  async (
    name: string,
    qty: number,
    imageSize: string
  ): Promise<HomePageQueried> => {
    const data = await fetchAPI(query, {
      variables: {
        name,
        qty,
        imageSize
      }
    })

    return data?.posts
  },
  ['data-home'],
  {
    revalidate: 3600 // 1 hour
  }
)
