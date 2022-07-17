import { fetchAPI } from '../fetchAPI'
import { query } from './query'

export const getAllCategoriesWithSlug = async () => {
  const data = await fetchAPI(query)
  return data?.categories
}
