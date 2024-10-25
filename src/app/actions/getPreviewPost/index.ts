'use server'

import { fetchAPI } from '@app/actions/fetchAPI'
import { TIME_REVALIDATE } from '@lib/constants'
import { Post } from '@lib/types'

import { query } from './query'

export const getPreviewPost = async (
  id: string | string[],
  idType = 'DATABASE_ID'
): Promise<Post> => {
  const data = await fetchAPI({
    revalidate: TIME_REVALIDATE.DAY,
    query,
    variables: { id, idType }
  })
  return data.post
}
