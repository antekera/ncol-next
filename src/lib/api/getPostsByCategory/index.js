import { fetchAPI } from '../fetchAPI'
import { query } from './query'

export const getPostsByCategory = async slug => {
  return await fetchAPI(query, {
    variables: {
      slug
    }
  })
}
