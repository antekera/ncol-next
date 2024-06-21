export const query = `
query CategoryPagePosts($slug: String!, $qty: Int!, $endCursor: String) {
  posts(
    first: $qty, after: $endCursor, last: null, before: null
    where: {orderby: {field: DATE, order: DESC}, categoryName: $slug, status: PUBLISH}
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
            sourceUrl(size: SLIDER_SMALL)
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
