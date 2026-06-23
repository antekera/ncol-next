import { IMAGE_SIZES } from '@lib/constants'

const postFields = `
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
`

// Fetches recent posts from a category; caller picks the one with noticiadestacada=true
export const queryRecentFromCategory = `
query RecentFromCategory($slug: String!, $qty: Int!) {
  posts(
    first: $qty
    where: { orderby: { field: DATE, order: DESC }, categoryName: $slug, status: PUBLISH }
  ) {
    edges {
      node {
        ${postFields}
      }
    }
  }
}
`
