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
        }
      }
    }
  }
`

export const query = `
  ${postFragment}
  
  query GetHomePosts(
    $coverSlug: String!, 
    $leftSlug: String!, 
    $rightSlug: String!, 
    $qty: Int!, 
    $leftCursor: String, 
    $rightCursor: String
  ) {
    cover: posts(
      first: 1, 
      where: {orderby: {field: DATE, order: DESC}, categoryName: $coverSlug, status: PUBLISH}
    ) {
      edges {
        node {
          ...PostFields
          featuredImage {
            node {
              sourceUrl(size: ${IMAGE_SIZES.LARGE})
            }
          }
        }
      }
    }
    
    left: posts(
      first: $qty,
      after: $leftCursor,
      where: {orderby: {field: DATE, order: DESC}, categoryName: $leftSlug, status: PUBLISH}
    ) {
      edges {
        node {
          ...PostFields
          content
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
    
    right: posts(
      first: $qty,
      after: $rightCursor,
      where: {orderby: {field: DATE, order: DESC}, categoryName: $rightSlug, status: PUBLISH}
    ) {
      edges {
        node {
          ...PostFields
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
        content
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
