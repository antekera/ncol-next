import { BaseClient } from './BaseClient'
import { SinglePost } from '@lib/types'
import type { HomeArticle, HomeModuleRequest } from '@lib/homeV2/types'

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

  async getHomeModules(
    modules: readonly HomeModuleRequest[]
  ): Promise<Record<string, HomeArticle[] | null> | null> {
    for (const moduleRequest of modules) {
      if (
        !Number.isInteger(moduleRequest.limit) ||
        moduleRequest.limit < 1 ||
        moduleRequest.limit > 30
      ) {
        throw new Error('Invalid editorial module limit')
      }
    }
    const active = modules.filter(
      module => module.categoryIds === null || module.categoryIds.length > 0
    )
    const empty = Object.fromEntries(
      modules
        .filter(module => module.categoryIds?.length === 0)
        .map(module => [module.id, []])
    )
    if (!active.length) return empty

    const variables: Record<string, readonly number[] | number> = {}
    const definitions: string[] = []
    const connections = active.map((module, index) => {
      definitions.push(`$limit${index}: Int!`)
      if (module.categoryIds !== null) {
        definitions.push(`$categories${index}: [ID!]`)
        variables[`categories${index}`] = module.categoryIds
      }
      variables[`limit${index}`] = module.limit
      return `m${index}: posts(first: $limit${index}, where: {
        ${module.categoryIds === null ? '' : `categoryIn: $categories${index},`} status: PUBLISH,
        orderby: { field: DATE, order: DESC }
        ${module.videoOnly ? 'metaQuery: { metaArray: [{ key: "videodestacado", compare: NOT_EQUAL_TO, value: "" }] }' : ''}
      }) {
        nodes {
          id title uri slug date excerpt
          featuredImage { node { sourceUrl(size: LARGE) srcSet } }
          categories { edges { node { name slug parentId } } }
          customFields { noticiadestacada videodestacado }
        }
      }`
    })
    const result = await this.post<
      Record<string, { nodes: HomeArticle[] } | null>
    >(
      {
        query: `query HomeEditorialModules(${definitions.join(', ')}) { ${connections.join('\n')} }`,
        variables
      },
      { revalidate: 0 }
    )
    if (!result) return null
    return {
      ...empty,
      ...Object.fromEntries(
        active.map((module, index) => [
          module.id,
          result[`m${index}`]?.nodes ?? null
        ])
      )
    }
  }
}
