'use server'

import { unstable_cache as cache } from 'next/cache'

import { fetchAPI } from '@app/actions/fetchAPI'
import { CategoriesPath } from '@lib/types'

import { query } from './query'

export const getAllCategoriesWithSlug =
  cache(async (): Promise<CategoriesPath> => {
    const data = await fetchAPI(query)
    return data?.categories
  }, ['data-category'])
