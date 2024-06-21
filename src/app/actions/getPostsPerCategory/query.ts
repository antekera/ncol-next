export const query = `
query PostsPerCategory($slug: String!, $qty: Int!) {
  posts(
    first: $qty, after: null, last: null, before: null
    where: {dateQuery: {after: {month: 1}} ,orderby: {field: DATE, order: DESC}, categoryName: $slug, status: PUBLISH, authorNotIn: "1"}
  ) {
    edges {
    cursor
      node {
        title
        id
        uri
        date
        featuredImage {
          node {
            sourceUrl(size: THUMB_HOME_RIGHT)
          }
        }
      }
    }
  }
}
`

export const querySingle = `
query PostsPerCategory($slug: String!, $qty: Int!) {
  posts(
    first: $qty, after: null, last: null, before: null
    where: {dateQuery: {after: {month: 1}} ,orderby: {field: DATE, order: DESC}, categoryName: $slug, status: PUBLISH, authorNotIn: "1"}
  ) {
    edges {
    cursor
      node {
        title
        id
        uri
        date
        featuredImage {
          node {
            sourceUrl(size: THUMB_HOME_ARCHIVO)
          }
        }
      }
    }
  }
}
`
