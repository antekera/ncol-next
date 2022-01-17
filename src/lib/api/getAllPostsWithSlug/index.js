import { fetchAPI } from '../fetchAPI'
import { query } from './query'

export async function getAllPostsWithSlug() {
  const data = await fetchAPI(query)
  return data?.posts
}
