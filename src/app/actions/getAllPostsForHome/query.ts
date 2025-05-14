import { IMAGE_SIZES } from '@lib/constants'

const postFragment = `
  fragment PostFields on Post {
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
          parentId
        }
      }
    }
  }
`

export const query = `
  ${postFragment}
  
  query GetHomePosts($name: String!, $qty: Int!, $endCursor: String) {
  posts(
    first: $qty, after: $endCursor, last: null, before: null
    where: {orderby: {field: DATE, order: DESC}, categoryName: $name, status: PUBLISH}
  ) {
    edges {
      node {
        ...PostFields
        tags {
          edges {
            node {
              id
              name
              slug
            }
          }
        }
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

export const queryLeft = `
${postFragment}

query GetLeftPosts($name: String!, $qty: Int!, $endCursor: String) {
  posts(
    first: $qty, after: $endCursor, last: null, before: null
    where: {orderby: {field: DATE, order: DESC}, categoryName: $name, status: PUBLISH}
  ) {
    edges {
      node {
        ...PostFields
        tags {
          edges {
            node {
              id
              name
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
