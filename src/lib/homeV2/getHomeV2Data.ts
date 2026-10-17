import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { categoriesClient, postsClient } from '@lib/api'
import { TIME_REVALIDATE } from '@lib/constants'
import { loadHomeV2Data } from './loadHomeV2Data'
import { HOME_V2_SECTIONS } from './sections'
import type { HomeV2Data } from './types'

class IncompleteHomeData extends Error {
  constructor(readonly data: HomeV2Data) {
    super('Incomplete Home V2 editorial data')
  }
}

const loadCachedHomeV2 = unstable_cache(
  async () => {
    const data = await loadHomeV2Data({
      categories: categoriesClient,
      posts: postsClient
    })
    // Render partial results, but do not persist a CMS failure as a healthy hour.
    if (data.errors.length) throw new IncompleteHomeData(data)
    return data
  },
  ['home-v2-editorial-v1', JSON.stringify(HOME_V2_SECTIONS)],
  {
    revalidate: TIME_REVALIDATE.HOUR,
    tags: [
      'homepage',
      'featured-post',
      ...HOME_V2_SECTIONS.map(section => `category-${section.categorySlug}`)
    ]
  }
)

// React cache also shares an in-flight load among server consumers in a render.
export const getHomeV2Data = cache(async (): Promise<HomeV2Data> => {
  try {
    return await loadCachedHomeV2()
  } catch (error) {
    if (error instanceof IncompleteHomeData) return error.data
    throw error
  }
})
