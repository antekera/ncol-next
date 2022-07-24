export const query = `
query CategoryPagePosts($slug: String!, $qty: Int!) {
  posts(
    first: $qty, after: null, last: null, before: null
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
            sourceUrl(size: LARGE)
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
  categories(where: {slug: "costa-oriental"}) {
    edges {
      node {
        name
        categoryId
        children {
          edges {
            node {
              name
              slug
            }
          }
        }
      }
    }
  }
}
`
