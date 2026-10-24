import type { PostHome } from '@lib/types'

export type OpeningTreatment = 'current' | 'photographic' | 'traditional'

// Editorial cards do not require the article body or pagination metadata.
export interface HomeArticle {
  id?: string
  uri: string
  title: string
  date?: string
  excerpt?: string
  featuredImage?: PostHome['featuredImage'] | null
  categories: Pick<PostHome['categories'], 'edges'>
  customFields?: PostHome['customFields']
}

export interface HomeCategory {
  id: string
  databaseId: number
  name: string
  slug: string
  parentId: string | null
}

export interface HomeTaxonomyPage {
  nodes: HomeCategory[]
  pageInfo: { hasNextPage: boolean; endCursor: string | null }
}

export interface HomeSectionConfig {
  id: string
  title: string
  categorySlug: string
  position: number
  presentation: 'opening' | 'regional' | 'lead_list' | 'text_list' | 'video'
  limit: number
  href: string
  includeDescendants: boolean
  source?: 'latest' | 'video'
  allowRepeatedArticles?: boolean
}

export interface HomeModuleRequest {
  id: string
  categoryIds: readonly number[] | null
  limit: number
  videoOnly?: boolean
  includeOpeningFields?: boolean
  featuredOnly?: boolean
}

export interface HomeV2Data {
  featured: HomeArticle | null
  openingCategorySlugs?: string[]
  sections: Record<string, HomeArticle[]>
  regions: HomeCategory[]
  errors: string[]
}

/** Unfiltered candidates; eligibility is applied after reading the snapshot. */
export interface HomeSnapshot {
  data: HomeV2Data
  fetchedAt: number
}

export interface HomeModulesResult {
  modules: Record<string, HomeArticle[] | null> | null
  hasErrors: boolean
}

export interface HomeSection extends HomeSectionConfig {
  articles: HomeArticle[]
}
