export const queryVideoPosts = `
query VideoPosts {
  posts(
    first: 100
    where: {
      orderby: { field: DATE, order: DESC }
      status: PUBLISH
      metaQuery: {
        metaArray: [
          { key: "videodestacado", compare: EXISTS }
        ]
      }
    }
  ) {
    edges {
      node {
        id
        title
        uri
        date
        slug
        categories {
          edges {
            node {
              name
              slug
              parentId
            }
          }
        }
        customFields {
          videodestacado
        }
      }
    }
  }
}
`
