import { fetchAPI } from '@lib/api/fetchAPI'
import { Post } from '@lib/types'

import { query } from './query'

export const getPreviewPost = async (
  id: string | string[],
  idType = 'DATABASE_ID'
): Promise<Post> => {
  const data = await fetchAPI(query, {
    variables: { id, idType }
  })
  return data.post
}
