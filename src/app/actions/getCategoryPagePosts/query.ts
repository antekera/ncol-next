import { IMAGE_SIZES } from '@lib/constants'

export const query = `
query CategoryPagePosts($slug: String!, $qty: Int!, $offset: Int!) {
  posts(
    first: $qty, last: null, before: null
    where: {offsetPagination: { size: $qty, offset: $offset },orderby: {field: DATE, order: DESC}, categoryName: $slug, status: PUBLISH}
  ) {
    edges {
    cursor
      node {
        title
        excerpt
        id
        uri
        date
        featuredImage {
          node {
            sourceUrl(size: ${IMAGE_SIZES.MEDIUM})
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
