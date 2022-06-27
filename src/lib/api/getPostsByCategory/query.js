export const query = `
query AllPostsByCategory($slug: String! ) {
  posts(
    first: 10
    where: {orderby: {field: DATE, order: DESC}, categoryName: $slug}
  ) {
    edges {
      node {
        title
        excerpt
        slug
        uri
        date
        featuredImage {
          node {
            sourceUrl(size: IMAGE_INSIDE)
            srcSet
          }
        }
        categories {
          edges {
            node {
              name
              uri
              slug
            }
          }
        }
      }
    }
  }
}
`
