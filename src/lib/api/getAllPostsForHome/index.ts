import { fetchAPI } from '@lib/api/fetchAPI'
import { HomePageQueried } from '@lib/types'

import { query } from './query'

export const getPostsForHome = async (
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
}
