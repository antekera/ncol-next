import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { categoriesClient, postsClient } from '@lib/api'
import { loadHomeTaxonomies, loadHomeV2Snapshot } from './loadHomeV2Data'
import { HOME_V2_REVALIDATE_SECONDS, HOME_V2_SECTIONS } from './sections'
import type { HomeCategory, HomeV2Data } from './types'
import { filterHomeHeadlineDates, homeEditorialDay } from './editorialPolicy'
import { HOME_V2_PUBLIC_CACHE_TAG, isHomeV2PublicEnabled } from './release'

const publicHome = isHomeV2PublicEnabled()
const categoryTags = HOME_V2_SECTIONS.filter(
  section => section.categorySlug
).map(section => `category-${section.categorySlug}`)

interface HomeSnapshot {
  data: HomeV2Data
  fetchedAt: number
}

class IncompleteHomeData extends Error {
  constructor(readonly snapshot: HomeSnapshot) {
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
  async (categories: HomeCategory[]): Promise<HomeSnapshot> => {
    const fetchedAt = Date.now()
    const data = await loadHomeV2Snapshot(
      {
        categories: categoriesClient,
        posts: postsClient
      },
      HOME_V2_SECTIONS,
      categories
    )
    // Render partial results, but do not persist a CMS failure as a healthy snapshot.
    const snapshot = { data, fetchedAt }
    if (data.errors.length) throw new IncompleteHomeData(snapshot)
    return snapshot
  },
  [
    publicHome ? 'home-v2-public-editorial-raw-v2' : 'home-v2-editorial-raw-v9',
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
  let snapshot: HomeSnapshot
  try {
    snapshot = await loadCachedHomeV2(categories)
  } catch (error) {
    if (!(error instanceof IncompleteHomeData)) throw error
    snapshot = error.snapshot
  }
  const now = Date.now()
  return filterHomeHeadlineDates(
    snapshot.data,
    homeEditorialDay(new Date(now)),
    now,
    homeEditorialDay(new Date(snapshot.fetchedAt))
  )
})
