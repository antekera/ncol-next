export const query = `
query AllPostsByCategory($slug: String! ) {
  posts(
    first: 40, after: null, last: null, before: null
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
        postId
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
