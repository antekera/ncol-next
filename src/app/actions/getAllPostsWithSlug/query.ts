export const query = `
{
  posts(first: 1000) {
    edges {
      node {
        uri
      }
    }
  }
}
`
