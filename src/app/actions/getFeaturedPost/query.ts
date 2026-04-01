import { IMAGE_SIZES } from '@lib/constants'

// Fetches the first post with post_destacado=true, ordered by date DESC
export const queryFeaturedPost = `
query FeaturedPost {
  posts(
    first: 1
    where: { orderby: { field: DATE, order: DESC }, status: PUBLISH, metaQuery: { metaArray: [{ key: "post_destacado", value: "1", compare: EQUAL_TO }] } }
  ) {
    edges {
      node {
        title
        excerpt
        id
        uri
        date
        slug
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
        customFields {
          videodestacado
          noticiadestacada
        }
      }
    }
  }
}
`

// Fetches the most recent post from the given category slug
export const queryLatestFromCategory = `
query LatestFromCategory($slug: String!) {
  posts(
    first: 1
    where: { orderby: { field: DATE, order: DESC }, categoryName: $slug, status: PUBLISH }
  ) {
    edges {
      node {
        title
        excerpt
        id
        uri
        date
        slug
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
        customFields {
          videodestacado
          noticiadestacada
        }
      }
    }
  }
}
`
