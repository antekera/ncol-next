import { fetchAPI } from '../fetchAPI'
import { query } from './query'

export async function getPostsByCategory(slug) {
  return await fetchAPI(query, {
    variables: {
      slug,
    },
  })
}
