export const query = `
{
  posts(first: 50) {
    edges {
      node {
        uri
      }
    }
  }
}
`
