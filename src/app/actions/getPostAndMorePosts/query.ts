const FRAGMENT_POST_FIELDS = `fragment PostFields on Post {
      title
      slug
      date
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
            name
            uri
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

export const query = ({ isRevision, relatedSearch }: PostQuery) => {
  return `
    ${FRAGMENT_POST_FIELDS}
    query PostBySlug($id: ID!, $idType: PostIdType!) {
      post(id: $id, idType: $idType) {
        ...PostFields
        featuredImage {
          node {
            sourceUrl(size: SLIDER_BIG2)
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
      posts(first: 10, where: { search: "${relatedSearch}", dateQuery: {after: {month: 1}} , status: PUBLISH, authorNotIn: "1", orderby: { field: DATE, order: DESC } }) {
        edges {
          node {
            ...PostFields
            featuredImage {
              node {
                sourceUrl(size: THUMB_HOME_RIGHT)
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
