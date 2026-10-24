'use server'

import { isHomeV2PreviewEnabled } from '@lib/homeV2/preview'
import { isHomeV2PublicEnabled } from '@lib/homeV2/release'
import { getHomeV2RegionData } from '@lib/homeV2/getHomeV2RegionData'
import type { HomeArticle } from '@lib/homeV2/types'

export async function getHomeV2Region(
  region: string
): Promise<{ ok: boolean; articles: HomeArticle[] }> {
  if (!isHomeV2PreviewEnabled() && !isHomeV2PublicEnabled()) {
    return { ok: false, articles: [] }
  }
  const { ok, articles } = await getHomeV2RegionData(region)
  return { ok, articles }
}
