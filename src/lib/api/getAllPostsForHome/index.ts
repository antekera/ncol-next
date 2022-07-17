import { fetchAPI } from '@lib/api/fetchAPI'
import { PostsQueried } from '@lib/types'

import { query } from './query'

export const getAllPostsForHome = async (
  preview: boolean
): Promise<PostsQueried> => {
  const data = await fetchAPI(query, {
    variables: {
      onlyEnabled: !preview,
      preview
    }
  })

  return data?.posts
}
