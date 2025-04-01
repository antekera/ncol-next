export const query = `
{
  categories(first: 50) {
    edges {
      node {
        slug
      }
    }
  }
}
`
