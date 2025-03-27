export const query = `
{
  tags(first: 150) {
    edges {
      node {
        slug
      }
    }
  }
}
`
