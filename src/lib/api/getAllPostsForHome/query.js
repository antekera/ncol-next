export const query = `
query AllPosts {
  posts(first: 70, where: { orderby: { field: DATE, order: DESC } }) {
    edges {
      node {
        title
        excerpt
        slug
        uri
        date
        featuredImage {
          node {
            sourceUrl
          }
        }
      }
    }
  }
}
`
