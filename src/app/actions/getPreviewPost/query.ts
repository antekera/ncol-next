export const query = `
query PreviewPost($id: ID!, $idType: PostIdType!) {
  post(id: $id, idType: $idType) {
    databaseId
    slug
    uri
    status
  }
}`
