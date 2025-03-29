import { IMAGE_SIZES } from '@lib/constants'

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
            sourceUrl(size: ${IMAGE_SIZES.LARGE})
          }
        }
      }
    }
  }
}
`

export const queryLeft = `
query GetLeftPosts($name: String!, $qty: Int!, $endCursor: String) {
  posts(
    first: $qty, after: $endCursor, last: null, before: null
    where: {orderby: {field: DATE, order: DESC}, categoryName: $name, status: PUBLISH}
  ) {
    edges {
      node {
        id
        title
        uri
        date
        excerpt
        content
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
            sourceUrl(size: ${IMAGE_SIZES.MEDIUM})
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
}
`

export const queryRight = `
query GetRightPosts($name: String!, $qty: Int!, $endCursor: String) {
  posts(
    first: $qty, after: $endCursor, last: null, before: null
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
            sourceUrl(size: ${IMAGE_SIZES.MEDIUM})
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
}
`
