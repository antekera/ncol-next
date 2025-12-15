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
            srcSet
          }
        }
        content
        postId
        customFields {
          antetituloNoticia
          fuenteNoticia
          resumenIa
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
          srcSet
        }
      }
    }
  }
`

export const queryRelatedPosts = `
    query PostBySlug($search: String!) {
      posts(first: 6, where: { search: $search, dateQuery: {after: {month: 1}}, status: PUBLISH, authorNotIn: "1", orderby: { field: DATE, order: DESC } }) {
        edges {
          node {
          title
            slug
            date
            uri
            featuredImage {
              node {
                sourceUrl(size: ${IMAGE_SIZES.MEDIUM})
                altText
                caption
                srcSet
              }
            }
          }
        }
      }
    }
  `
