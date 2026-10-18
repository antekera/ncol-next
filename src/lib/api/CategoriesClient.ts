import { BaseClient } from './BaseClient'
import type { HomeTaxonomyPage } from '@lib/homeV2/types'

export class CategoriesClient extends BaseClient {
  async getHomeTaxonomyPage(
    after: string | null = null
  ): Promise<HomeTaxonomyPage | null> {
    const result = await this.postResult<{ categories: HomeTaxonomyPage }>(
      {
        query: `query HomeEditorialTaxonomies($after: String) {
        categories(first: 100, after: $after, where: { hideEmpty: false }) {
          nodes { id databaseId name slug parentId }
          pageInfo { hasNextPage endCursor }
        }
      }`,
        variables: { after }
      },
      { revalidate: 0 }
    )
    return result.hasErrors ? null : (result.data?.categories ?? null)
  }

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
