export const query = `
{
  categories(first: 100) {
    edges {
      node {
        uri
      }
    }
  }
}
`
