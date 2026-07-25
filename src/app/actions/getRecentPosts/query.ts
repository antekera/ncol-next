import { IMAGE_SIZES } from '@lib/constants'

export const query = `
query RecentPosts($qty: Int!, $offset: Int!, $content: Boolean! = false) {
  posts(
    first: $qty,
    where: {
      offsetPagination: { size: $qty, offset: $offset },
      orderby: { field: DATE, order: DESC },
      status: PUBLISH
    }
  ) {
    edges {
      cursor
      node {
        title
        excerpt
        id
        uri
        content @include(if: $content)
        slug
        date
        featuredImage {
          node {
            sourceUrl(size: ${IMAGE_SIZES.LARGE})
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
        tags {
          edges {
            node {
              id
              name
              slug
            }
          }
        }
        customFields {
          videodestacado
          noticiadestacada
        }
      }
    }
  }
}
`
