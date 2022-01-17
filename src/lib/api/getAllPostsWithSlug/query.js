export const query = `
{
  posts(first: 10000) {
    edges {
      node {
        slug
        uri
      }
    }
  }
}
`
