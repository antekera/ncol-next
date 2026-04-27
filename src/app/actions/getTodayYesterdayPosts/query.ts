import { IMAGE_SIZES } from '@lib/constants'

export const queryTodayYesterdayPosts = `
query TodayYesterdayPosts($slug: String!) {
  posts(
    first: 7
    where: {
      orderby: { field: DATE, order: DESC }
      categoryName: $slug
      status: PUBLISH
    }
  ) {
    edges {
      node {
        id
        title
        uri
        date
        excerpt
        featuredImage {
          node {
            sourceUrl(size: ${IMAGE_SIZES.LARGE})
            srcSet
            mediaDetails {
              width
              height
            }
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
        customFields {
          videodestacado
        }
      }
    }
  }
}
`
