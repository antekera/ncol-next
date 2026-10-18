import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { categoriesClient, postsClient } from '@lib/api'
import { loadHomeV2Data } from './loadHomeV2Data'
import { HOME_V2_REVALIDATE_SECONDS, HOME_V2_SECTIONS } from './sections'
import type { HomeV2Data } from './types'
import { filterHomeHeadlineDates, homeEditorialDay } from './editorialPolicy'

class IncompleteHomeData extends Error {
  constructor(readonly data: HomeV2Data) {
    super('Incomplete Home V2 editorial data')
  }
}

const loadCachedHomeV2 = unstable_cache(
  async (day: string) => {
    const data = await loadHomeV2Data(
      {
        categories: categoriesClient,
        posts: postsClient
      },
      HOME_V2_SECTIONS,
      day
    )
    // Render partial results, but do not persist a CMS failure as a healthy snapshot.
    if (data.errors.length) throw new IncompleteHomeData(data)
    return data
  },
  ['home-v2-editorial-v6', JSON.stringify(HOME_V2_SECTIONS)],
  {
    revalidate: HOME_V2_REVALIDATE_SECONDS,
    tags: [
      'homepage',
      'featured-post',
      ...HOME_V2_SECTIONS.filter(section => section.categorySlug).map(
        section => `category-${section.categorySlug}`
      )
    ]
  }
)

// React cache also shares an in-flight load among server consumers in a render.
export const getHomeV2Data = cache(async (): Promise<HomeV2Data> => {
  try {
    return filterHomeHeadlineDates(
      await loadCachedHomeV2(homeEditorialDay()),
      homeEditorialDay()
    )
  } catch (error) {
    if (error instanceof IncompleteHomeData)
      return filterHomeHeadlineDates(error.data, homeEditorialDay())
    throw error
  }
})
