export const query = `
query GetAllPostsForHome($name: String!, $qty: Int!) {
  posts(
    first: $qty, after: null, last: null, before: null
    where: {orderby: {field: DATE, order: DESC}, categoryName: $name, status: PUBLISH}
  ) {
    edges {
      node {
        id
        title
        uri
        date
        excerpt
        categories {
           edges {
              node {
                name
                uri
                slug
              }
          }
        }
        featuredImage {
          node {
            sourceUrl(size: LARGE)
          }
        }
      }
    }
  }
}
`
