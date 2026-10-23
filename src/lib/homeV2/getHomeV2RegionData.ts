import { unstable_cache } from 'next/cache'
import { postsClient } from '@lib/api'
import { getHomeV2Data } from '@lib/homeV2/getHomeV2Data'
import { composeHomeSections, getDescendantIds } from '@lib/homeV2/compose'
import {
  HOME_V2_REVALIDATE_SECONDS,
  HOME_V2_SECTIONS
} from '@lib/homeV2/sections'
import type { HomeArticle } from '@lib/homeV2/types'
import {
  homeEditorialDay,
  isHeadlineCurrent
} from '@lib/homeV2/editorialPolicy'

export async function getHomeV2RegionData(
  region: string
): Promise<{ ok: boolean; articles: HomeArticle[]; fetchedAt?: number }> {
  if (typeof region !== 'string' || region.length > 80)
    return { ok: false, articles: [] }
  const data = await getHomeV2Data()
  const category = data.regions.find(item => item.slug === region)
  const config = HOME_V2_SECTIONS.find(item => item.id === 'zulia')
  if (!category || !config) return { ok: false, articles: [] }
  try {
    const ids = getDescendantIds(data.regions).get(region) ?? []
    const day = homeEditorialDay()
    const load = unstable_cache(
      async () => {
        const result = await postsClient.getHomeModules([
          { id: 'zulia', categoryIds: ids, limit: 11 }
        ])
        if (result.hasErrors || !result.modules?.zulia)
          throw new Error('Regional news unavailable')
        return { articles: result.modules.zulia, fetchedAt: Date.now() }
      },
      ['home-v2-region-v7', day, region, JSON.stringify(ids)],
      {
        revalidate: HOME_V2_REVALIDATE_SECONDS,
        tags: ['homepage', `category-${region}`]
      }
    )
    const snapshot = await load()
    const articles = snapshot.articles.filter(article =>
      isHeadlineCurrent(article, homeEditorialDay())
    )
    return {
      ok: true,
      fetchedAt: snapshot.fetchedAt,
      articles: composeHomeSections(
        { ...data, sections: { zulia: articles } },
        [config]
      )[0].articles
    }
  } catch {
    return { ok: false, articles: [] }
  }
}
