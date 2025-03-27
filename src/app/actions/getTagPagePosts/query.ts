import { IMAGE_SIZES } from '@lib/constants'

export const query = `
query TagPagePosts($slug: String!, $qty: Int!, $endCursor: String) {
  posts(
    first: $qty, after: $endCursor, last: null, before: null
    where: {orderby: {field: DATE, order: DESC}, tag: $slug, status: PUBLISH}
  ) {
    edges {
    cursor
      node {
        title
        excerpt
        id
        uri
        date
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
