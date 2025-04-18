'use server'

import { cachedFetchAPI } from '@app/actions/fetchAPI'
import { TIME_REVALIDATE } from '@lib/constants'
import { CategoriesPath } from '@lib/types'
import { query } from './query'

export const getAllCategoriesWithSlug = async (): Promise<CategoriesPath> => {
  const data = await cachedFetchAPI({ query, revalidate: TIME_REVALIDATE.WEEK })
  return data?.categories
}
