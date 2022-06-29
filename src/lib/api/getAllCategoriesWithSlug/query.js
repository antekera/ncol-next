export const query = `
{
  categories(first: 150) {
    edges {
      node {
        slug
      }
    }
  }
}
`
