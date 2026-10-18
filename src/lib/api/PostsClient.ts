import { BaseClient } from './BaseClient'
import { SinglePost } from '@lib/types'
import type {
  HomeArticle,
  HomeModuleRequest,
  HomeModulesResult
} from '@lib/homeV2/types'

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
  ): Promise<HomeModulesResult> {
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
    if (!active.length) return { modules: empty, hasErrors: false }

    const variables: Record<string, readonly number[] | number> = {}
    const definitions: string[] = []
    const connections = active.map((module, index) => {
      definitions.push(`$limit${index}: Int!`)
      if (module.categoryIds !== null) {
        definitions.push(`$categories${index}: [ID!]`)
        variables[`categories${index}`] = module.categoryIds
      }
      variables[`limit${index}`] = module.limit
      const customFields = [
        module.includeOpeningFields && 'noticiadestacada',
        module.videoOnly && 'videodestacado'
      ]
        .filter(Boolean)
        .join(' ')
      const meta = [
        ...(module.videoOnly
          ? ['{ key: "videodestacado", compare: NOT_EQUAL_TO, value: "" }']
          : []),
        ...(module.featuredOnly
          ? ['{ key: "noticiadestacada", compare: EQUAL_TO, value: "1" }']
          : [])
      ]
      return `m${index}: posts(first: $limit${index}, where: {
        ${module.categoryIds === null ? '' : `categoryIn: $categories${index},`} status: PUBLISH,
        orderby: { field: DATE, order: DESC }
        ${meta.length ? `metaQuery: { relation: AND, metaArray: [${meta.join(',')}] }` : ''}
      }) {
        nodes {
          id title uri date
          ${module.includeOpeningFields ? 'excerpt' : ''}
          featuredImage { node { sourceUrl(size: LARGE) srcSet } }
          categories { edges { node { name slug } } }
          ${customFields ? `customFields { ${customFields} }` : ''}
        }
      }`
    })
    const result = await this.postResult<
      Record<string, { nodes: HomeArticle[] } | null>
    >(
      {
        query: `query HomeEditorialModules(${definitions.join(', ')}) { ${connections.join('\n')} }`,
        variables
      },
      { revalidate: 0 }
    )
    return {
      hasErrors: result.hasErrors,
      modules: result.data
        ? {
            ...empty,
            ...Object.fromEntries(
              active.map((module, index) => [
                module.id,
                result.data?.[`m${index}`]?.nodes ?? null
              ])
            )
          }
        : null
    }
  }
}
