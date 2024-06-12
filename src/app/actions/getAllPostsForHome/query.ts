export const queryCover = `
query GetCoverPost($name: String!, $qty: Int!) {
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
            sourceUrl(size: SLIDER_BIG2)
          }
        }
      }
    }
  }
}
`

export const queryLeft = `
query GetLeftPosts($name: String!, $qty: Int!) {
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
            sourceUrl(size: THUMB_HOME_RIGHT)
          }
        }
      }
    }
  }
}
`

export const queryRight = `
query GetRightPosts($name: String!, $qty: Int!) {
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
            sourceUrl(size: THUMB_HOME_ARCHIVO)
          }
        }
      }
    }
  }
}
`
