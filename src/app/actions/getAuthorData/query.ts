export const queryAuthorProfile = `
  query AuthorProfile($slug: ID!) {
    user(id: $slug, idType: SLUG) {
      name
      slug
      uri
      description
      databaseId
      avatar {
        url
      }
    }
  }
`

export const queryAuthorPosts = `
  query AuthorPosts($authorName: String!, $qty: Int!, $offset: Int!) {
    posts(
      first: $qty
      where: {
        authorName: $authorName
        status: PUBLISH
        offsetPagination: { size: $qty, offset: $offset }
        orderby: { field: DATE, order: DESC }
      }
    ) {
      edges {
        node {
          id
          title
          uri
          date
          featuredImage {
            node {
              sourceUrl(size: MEDIUM)
              srcSet
            }
          }
          categories {
            edges {
              node {
                name
                slug
                parentId
              }
            }
          }
        }
      }
    }
  }
`
