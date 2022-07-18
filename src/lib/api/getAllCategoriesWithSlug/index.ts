import { fetchAPI } from '@lib/api/fetchAPI'
import { CategoriesPath } from '@lib/types'

import { query } from './query'

export const getAllCategoriesWithSlug = async (): Promise<CategoriesPath> => {
  const data = await fetchAPI(query)
  return data?.categories
}
