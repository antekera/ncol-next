const FRAGMENT_POST_FIELDS = `fragment PostFields on Post {
      title
      slug
      date
      featuredImage {
        node {
          sourceUrl
          altText
          caption
        }
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

export const query = (isRevision: boolean) => {
  return `
    ${FRAGMENT_POST_FIELDS}
    query PostBySlug($id: ID!, $idType: PostIdType!) {
      post(id: $id, idType: $idType) {
        ...PostFields
        content
        customFields {
          antetituloNoticia
          fuenteNoticia
          videoNoticia
        }
        ${checkRevision(isRevision)}
      }
      posts(first: 3, where: { orderby: { field: DATE, order: DESC } }) {
        edges {
          node {
            ...PostFields
          }
        }
      }
    }
  `
}
