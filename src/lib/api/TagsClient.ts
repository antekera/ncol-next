import { BaseClient } from './BaseClient'

export class TagsClient extends BaseClient {
  async getAllWithSlug() {
    const query = `
      query AllTags {
        tags {
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
