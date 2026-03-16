import { BaseClient } from './BaseClient'

export class CategoriesClient extends BaseClient {
  async getAllWithSlug() {
    const query = `
      query AllCategories {
        categories {
          edges {
            node {
              slug
            }
          }
        }
      }
    `
    return this.post({ query })
  }
}
