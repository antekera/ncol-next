'use server'

import { cachedFetchAPI } from '@app/actions/fetchAPI'
import { TIME_REVALIDATE } from '@lib/constants'
import { TagsPath } from '@lib/types'
import { query } from './query'

export const getAllTagsWithSlug = async (): Promise<TagsPath> => {
  const data = await cachedFetchAPI<{ tags: TagsPath }>({
    query,
    revalidate: TIME_REVALIDATE.WEEK
  })
  return data?.tags as TagsPath
}
