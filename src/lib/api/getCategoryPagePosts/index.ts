import { fetchAPI } from '@lib/api/fetchAPI'
import { PostsCategoryQueried } from '@lib/types'

import { query } from './query'

export const getCategoryPagePosts = async (
  slug: string,
  qty: number
): Promise<PostsCategoryQueried> => {
  const data = await fetchAPI(query, {
    variables: {
      slug,
      qty
    }
  })

  return data?.posts
}
