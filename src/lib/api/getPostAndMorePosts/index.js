import { fetchAPI } from '../fetchAPI'
import { query } from './query'

const DRAFT = 'draft'
const PUBLISH = 'publish'
const DATABASE_ID = 'DATABASE_ID'
const SLUG = 'SLUG'

export const getPostAndMorePosts = async (slug, preview, previewData) => {
  const postPreview = preview && previewData?.post
  const isId = Number.isInteger(Number(slug)) // The slug is the id of the unpublished post
  const isSamePost = isId
    ? Number(slug) === postPreview.id
    : slug === postPreview.slug
  const isDraft = isSamePost && postPreview?.status === DRAFT
  const isRevision = isSamePost && postPreview?.status === PUBLISH

  const data = await fetchAPI(query(isRevision), {
    variables: {
      id: isDraft ? postPreview.id : slug,
      idType: isDraft ? DATABASE_ID : SLUG
    }
  })

  // Draft posts may not have an slug
  if (isDraft) data.post.slug = postPreview.id

  // Apply a revision (changes in a published post)
  if (isRevision && data.post.revisions) {
    const revision = data.post.revisions.edges[0]?.node

    if (revision) Object.assign(data.post, revision)
    delete data.post.revisions
  }

  // Filter out the main post
  data.posts.edges = data.posts.edges.filter(({ node }) => node.slug !== slug)
  // If there are still 3 posts, remove the last one
  if (data.posts.edges.length > 2) data.posts.edges.pop()

  return data
}
