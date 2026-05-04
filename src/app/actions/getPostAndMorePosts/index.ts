'use server'

import { cachedFetchAPI } from '@app/actions/fetchAPI'
import { TIME_REVALIDATE } from '@lib/constants'
import { SinglePost } from '@lib/types'
import { queryMetaData, query } from './query'

const URI = 'URI'

export const getMetadataPosts = async (
  slug: string
): Promise<Partial<SinglePost>> => {
  const data = await cachedFetchAPI<SinglePost>({
    revalidate: TIME_REVALIDATE.WEEK,
    query: queryMetaData,
    variables: {
      id: slug,
      idType: URI
    }
  })

  return data ?? {}
}

export const getSinglePost = async (
  slug: string
): Promise<{ post?: SinglePost }> => {
  const data = await cachedFetchAPI<{ post: SinglePost }>({
    revalidate: TIME_REVALIDATE.WEEK,
    query: query({ isRevision: false }),
    variables: {
      id: slug,
      idType: 'URI'
    }
  })

  return data ?? {}
}
