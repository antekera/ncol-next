export const query = `
  query OpinionAuthors($qty: Int!) {
    posts(
      first: $qty
      where: {
        categoryName: "opinion"
        status: PUBLISH
        orderby: { field: DATE, order: DESC }
      }
    ) {
      edges {
        node {
          title
          uri
          author {
            node {
              name
              slug
              uri
              databaseId
              avatar {
                url
              }
            }
          }
        }
      }
    }
  }
`
