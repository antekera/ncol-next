import { IMAGE_SIZES } from '@lib/constants'

const FRAGMENT_POST_FIELDS = `fragment PostFields on Post {
      title
      slug
      date
      excerpt
      contentType {
        cursor
      }
      categories {
        edges {
          node {
            name
            uri
            slug
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
      contentType {
        node {
          id
        }
      }
      isPreview
      isRestricted
      isRevision
      status
      template {
        templateName
      }
      uri
    }`

const checkRevision = (isRevision: boolean) => {
  return `${
    isRevision
      ? `
        revisions(first: 1, where: { orderby: { field: MODIFIED, order: DESC } }) {
          edges {
            node {
              title
              excerpt
              content
            }
          }
        }
        `
      : ''
  }`
}

interface PostQuery {
  isRevision: boolean
  relatedSearch: string
}

export const query = ({ isRevision }: PostQuery) => {
  return `
    ${FRAGMENT_POST_FIELDS}
    query PostBySlug($id: ID!, $idType: PostIdType!) {
      post(id: $id, idType: $idType) {
        ...PostFields
        featuredImage {
          node {
            sourceUrl(size: ${IMAGE_SIZES.LARGE})
            altText
            caption
          }
        }
        content
        postId
        customFields {
          antetituloNoticia
          fuenteNoticia
          videoNoticia
        }
        ${checkRevision(isRevision)}
      }
    }
  `
}

export const queryMetaData = `
  query PostBySlug($id: ID!, $idType: PostIdType!) {
    post(id: $id, idType: $idType) {
      title
      date
      excerpt
      uri
      featuredImage {
        node {
          sourceUrl(size: ${IMAGE_SIZES.LARGE})
          altText
          caption
        }
      }
    }
  }
`

export const queryRelatedPosts = () => {
  return `
    ${FRAGMENT_POST_FIELDS}
    query PostBySlug($id: ID!, $idType: PostIdType!) {
      posts(first: 30, where: { dateQuery: {after: {month: 1}} , status: PUBLISH, authorNotIn: "1", orderby: { field: DATE, order: DESC } }) {
        edges {
          node {
            ...PostFields
            featuredImage {
              node {
                sourceUrl(size: ${IMAGE_SIZES.MEDIUM})
                altText
                caption
              }
            }
          }
        }
      }
    }
  `
}
