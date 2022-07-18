import { fetchAPI } from '@lib/api/fetchAPI'
import { PostsCategoryQueried } from '@lib/types'

import { query } from './query'

export const getPostsByCategory = async (
  slug: string
): Promise<PostsCategoryQueried> => {
  const data = await fetchAPI(query, {
    variables: {
      slug
    }
  })

  return data.posts
}
