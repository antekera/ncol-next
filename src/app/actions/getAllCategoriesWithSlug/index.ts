'use server'

import { unstable_cache as cache } from 'next/cache'

import { fetchAPI } from '@app/actions/fetchAPI'
import { TIME_REVALIDATE } from '@lib/constants'
import { CategoriesPath } from '@lib/types'

import { query } from './query'

export const getAllCategoriesWithSlug =
  cache(async (): Promise<CategoriesPath> => {
    const data = await fetchAPI({ query, revalidate: TIME_REVALIDATE.DAY })
    return data?.categories
  }, ['data-category'])
