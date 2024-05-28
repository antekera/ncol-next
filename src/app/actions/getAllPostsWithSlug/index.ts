'use server'
import { fetchAPI } from '@app/actions/fetchAPI'
import { PostPath } from '@lib/types'

import { query } from './query'

export const getAllPostsWithSlug = async (): Promise<PostPath> => {
  const data = await fetchAPI(query)
  return data?.posts
}
