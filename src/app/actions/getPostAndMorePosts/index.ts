'use server'

import { cachedFetchAPI } from '@app/actions/fetchAPI'
import { TIME_REVALIDATE } from '@lib/constants'
import { SinglePost } from '@lib/types'
import { query, queryMetaData } from './query'

const DRAFT = 'draft'
const PUBLISH = 'publish'
const DATABASE_ID = 'DATABASE_ID'
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

export const getPostAndMorePosts = async (
  slug: string,
  preview: boolean | undefined,
  previewData?: any,
  relatedSearch = 'cabimas'
): Promise<Partial<SinglePost>> => {
  const postPreview = preview ? previewData?.post : undefined
  const idPreview = postPreview?.id || ''
  const slugPreview = postPreview?.slug || ''
  const statusPreview = postPreview?.status || ''
  const isId = Number.isInteger(Number(slug)) // The slug is the id of the unpublished post
  const isSamePost = isId ? slug === idPreview : slug === slugPreview
  const isDraft = isSamePost && statusPreview === DRAFT
  const isRevision = isSamePost && statusPreview === PUBLISH
  const queryOptions = {
    isRevision,
    relatedSearch
  }
  const data = await cachedFetchAPI({
    revalidate: TIME_REVALIDATE.WEEK,
    query: query(queryOptions),
    variables: {
      id: isDraft ? idPreview : slug,
      idType: isDraft ? DATABASE_ID : SLUG
    }
  })

  if (!data?.post) {
    return {
      post: undefined
    }
  }

  // Draft posts may not have an slug
  if (isDraft) {
    data.post.slug = idPreview
  }

  // Apply a revision (changes in a published post)
  if (isRevision && data.post.revisions) {
    const revision = data.post.revisions.edges[0]?.node

    if (revision) {
      Object.assign(data.post, revision)
    }

    delete data.post.revisions
  }

  return data
}
