import { fetchAPI } from '../fetchAPI'
import { query } from './query'

export async function getAllCategoriesWithSlug() {
  const data = await fetchAPI(query)
  return data?.categories
}
