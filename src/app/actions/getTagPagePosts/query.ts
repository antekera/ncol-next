import { IMAGE_SIZES } from '@lib/constants'

export const query = `
query TagPagePosts($slug: String!, $qty: Int!, $offset: Int!) {
  posts(
    first: $qty, last: null, before: null
    where: {offsetPagination: { size: $qty, offset: $offset },orderby: {field: DATE, order: DESC}, tag: $slug, status: PUBLISH}
  ) {
    edges {
    cursor
      node {
        title
        excerpt
        id
        uri
        date
        categories {
          edges {
            node {
              name
              uri
              slug
              parentId
            }
          }
        }
        featuredImage {
          node {
            sourceUrl(size: ${IMAGE_SIZES.MEDIUM})
          }
        }
      }
    }
    pageInfo {
      endCursor
      hasNextPage
      hasPreviousPage
      startCursor
    }
  }
}
`
