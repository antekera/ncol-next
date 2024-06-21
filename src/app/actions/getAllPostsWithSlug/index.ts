'use server'

import { unstable_cache as cache } from 'next/cache'

import { fetchAPI } from '@app/actions/fetchAPI'
import { TIME_REVALIDATE } from '@lib/constants'
import { PostPath } from '@lib/types'

import { query } from './query'

export const getAllPostsWithSlug = cache(async (): Promise<PostPath> => {
  const data = await fetchAPI({ query, revalidate: TIME_REVALIDATE.DAY })
  return data?.posts
}, ['data-single'])
