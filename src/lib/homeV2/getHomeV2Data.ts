import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { categoriesClient, postsClient } from '@lib/api'
import { loadHomeTaxonomies, loadHomeV2Data } from './loadHomeV2Data'
import { HOME_V2_REVALIDATE_SECONDS, HOME_V2_SECTIONS } from './sections'
import type { HomeCategory, HomeV2Data } from './types'
import { filterHomeHeadlineDates, homeEditorialDay } from './editorialPolicy'
import { HOME_V2_PUBLIC_CACHE_TAG, isHomeV2PublicEnabled } from './release'

const publicHome = isHomeV2PublicEnabled()
const categoryTags = HOME_V2_SECTIONS.filter(
  section => section.categorySlug
).map(section => `category-${section.categorySlug}`)

class IncompleteHomeData extends Error {
  constructor(readonly data: HomeV2Data) {
    super('Incomplete Home V2 editorial data')
  }
}

const cachedTaxonomies = unstable_cache(
  async () => {
    const categories = await loadHomeTaxonomies(categoriesClient)
    if (!categories) throw new Error('Home taxonomies unavailable')
    return categories
  },
  [publicHome ? 'home-v2-public-taxonomies-v1' : 'home-v2-taxonomies-v1'],
  {
    revalidate: 3600,
    tags: publicHome
      ? [HOME_V2_PUBLIC_CACHE_TAG]
      : ['homepage', ...categoryTags]
  }
)

// Regions and Home share taxonomy without loading each other's editorial data.
export const getHomeV2Taxonomies = cache(cachedTaxonomies)

const loadCachedHomeV2 = unstable_cache(
  async (day: string, categories: HomeCategory[]) => {
    const data = await loadHomeV2Data(
      {
        categories: categoriesClient,
        posts: postsClient
      },
      HOME_V2_SECTIONS,
      day,
      categories
    )
    // Render partial results, but do not persist a CMS failure as a healthy snapshot.
    if (data.errors.length) throw new IncompleteHomeData(data)
    return data
  },
  [
    publicHome ? 'home-v2-public-editorial-v1' : 'home-v2-editorial-v8',
    JSON.stringify(HOME_V2_SECTIONS)
  ],
  {
    revalidate: HOME_V2_REVALIDATE_SECONDS,
    tags: publicHome
      ? [HOME_V2_PUBLIC_CACHE_TAG]
      : ['homepage', 'featured-post', ...categoryTags]
  }
)

// React cache also shares an in-flight load among server consumers in a render.
export const getHomeV2Data = cache(async (): Promise<HomeV2Data> => {
  let categories: HomeCategory[]
  try {
    // Nested unstable_cache calls bypass their reads in this Next version.
    // Resolve this independent cache before entering the editorial boundary.
    categories = await getHomeV2Taxonomies()
  } catch {
    return { featured: null, sections: {}, regions: [], errors: ['taxonomies'] }
  }
  try {
    return filterHomeHeadlineDates(
      await loadCachedHomeV2(homeEditorialDay(), categories),
      homeEditorialDay()
    )
  } catch (error) {
    if (error instanceof IncompleteHomeData)
      return filterHomeHeadlineDates(error.data, homeEditorialDay())
    throw error
  }
})
