export const query = `
{
  tags(first: 50) {
    edges {
      node {
        slug
      }
    }
  }
}
`
