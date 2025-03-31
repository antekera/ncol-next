export const query = `
{
  posts(first: 500) {
    edges {
      node {
        uri
      }
    }
  }
}
`
