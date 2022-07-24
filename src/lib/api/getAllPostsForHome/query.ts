export const query = `
query GetAllPostsForHome($name: String!, $qty: Int!) {
  posts(
    first: $qty, after: null, last: null, before: null
    where: {orderby: {field: DATE, order: DESC}, categoryName: $name, status: PUBLISH}
  ) {
    edges {
      node {
        title
        id
        slug
        uri
        date
        excerpt(format: RAW)
        featuredImage {
          node {
            sourceUrl(size: MEDIUM)
          }
        }
      }
    }
  }
}
`
