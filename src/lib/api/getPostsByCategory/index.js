import { fetchAPI } from '../fetchAPI'
import { query } from './query'

export async function getPostsByCategory(slug) {
  const data = await fetchAPI(query, {
    variables: {
      slug,
    },
  })

  return data?.posts
}
