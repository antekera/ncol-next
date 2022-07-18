export const query = `
{
  posts(first: 20000) {
    edges {
      node {
        uri
      }
    }
  }
}
`
