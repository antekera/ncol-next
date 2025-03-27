'use server'

import { cachedFetchAPI } from '@app/actions/fetchAPI'
import { TIME_REVALIDATE } from '@lib/constants'
import { PostPath } from '@lib/types'
import { query } from './query'

export const getAllPostsWithSlug = async (): Promise<PostPath> => {
  const data = await cachedFetchAPI({ query, revalidate: TIME_REVALIDATE.DAY })
  return data?.posts
}
