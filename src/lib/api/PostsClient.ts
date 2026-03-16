import { BaseClient } from './BaseClient'
import { SinglePost } from '@lib/types'

export class PostsClient extends BaseClient {
  async getPostMetadata(slug: string): Promise<Partial<SinglePost> | null> {
    const query = `
      query PostBySlug($id: ID!, $idType: PostIdType!) {
        post(id: $id, idType: $idType) {
          title
          excerpt
          featuredImage {
            node {
              sourceUrl
            }
          }
        }
      }
    `
    const variables = { id: slug, idType: 'SLUG' }

    // Using a simple post for now, we can add cached versions later
    return this.post<SinglePost>({ query, variables })
  }

  // Add more methods as needed based on existing actions
}
