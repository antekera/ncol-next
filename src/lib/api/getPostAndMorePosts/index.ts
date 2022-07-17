import { fetchAPI } from '@lib/api/fetchAPI'
import { PostQueried, PostsMorePosts } from '@lib/types'

import { query } from './query'

const DRAFT = 'draft'
const PUBLISH = 'publish'
const DATABASE_ID = 'DATABASE_ID'
const SLUG = 'SLUG'

export const getPostAndMorePosts = async (
  slug: string | string[],
  preview: boolean | undefined,
  previewData?: any
): Promise<PostsMorePosts> => {
  const postPreview = preview ? previewData?.post : undefined
  const idPreview = postPreview?.id || ''
  const slugPreview = postPreview?.slug || ''
  const statusPreview = postPreview?.status || ''
  const isId = Number.isInteger(Number(slug)) // The slug is the id of the unpublished post
  const isSamePost = isId ? slug === idPreview : slug === slugPreview
  const isDraft = isSamePost && statusPreview === DRAFT
  const isRevision = isSamePost && statusPreview === PUBLISH

  const data = await fetchAPI(query(isRevision), {
    variables: {
      id: isDraft ? idPreview : slug,
      idType: isDraft ? DATABASE_ID : SLUG
    }
  })

  // Draft posts may not have an slug
  if (isDraft) data.post.slug = idPreview

  // Apply a revision (changes in a published post)
  if (isRevision && data.post.revisions) {
    const revision = data.post.revisions.edges[0]?.node

    if (revision) Object.assign(data.post, revision)
    delete data.post.revisions
  }

  data.posts.edges = data.posts.edges.filter(({ node }: PostQueried) => {
    return node.slug !== slug
  })
  if (data.posts.edges.length > 2) data.posts.edges.pop()

  return data
}
