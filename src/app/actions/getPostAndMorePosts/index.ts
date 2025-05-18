'use server'

import { cachedFetchAPI } from '@app/actions/fetchAPI'
import { TIME_REVALIDATE } from '@lib/constants'
import { SinglePost } from '@lib/types'
import { queryMetaData } from './query'

const SLUG = 'SLUG'

export const getMetadataPosts = async (
  slug: string
): Promise<Partial<SinglePost>> => {
  const data = await cachedFetchAPI({
    revalidate: TIME_REVALIDATE.WEEK,
    query: queryMetaData,
    variables: {
      id: slug,
      idType: SLUG
    }
  })

  return data
}
