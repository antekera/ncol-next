import { fetchAPI } from '../fetchAPI'
import { query } from './query'

export const getAllPostsWithSlug = async () => {
  const data = await fetchAPI(query)
  return data?.posts
}
