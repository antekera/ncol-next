'use client'

import useSWR from 'swr'

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(
  /\/$/,
  ''
)
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export interface ServedAd {
  id: string
  type: 'banner' | 'html'
  imageUrl: string | null
  imageUrlMobile: string | null
  htmlContent: string | null
  linkUrl: string | null
  slot: string
}

interface RawAd {
  id: string
  type: 'banner' | 'html'
  image_url: string | null
  image_url_mobile: string | null
  html_content: string | null
  link_url: string | null
  slot: string
}

async function fetchAllAds(): Promise<ServedAd[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return []
  const now = new Date().toISOString()
  const url =
    `${SUPABASE_URL}/rest/v1/ads` +
    `?select=id,type,image_url,image_url_mobile,html_content,link_url,slot` +
    `&status=eq.active` +
    `&starts_at=lte.${now}` +
    `&or=(ends_at.is.null,ends_at.gt.${now})`
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`
    }
  })
  if (!res.ok) return []
  const data: RawAd[] = await res.json()
  return data.map(ad => ({
    id: ad.id,
    type: ad.type,
    imageUrl: ad.image_url,
    imageUrlMobile: ad.image_url_mobile,
    htmlContent: ad.html_content,
    linkUrl: ad.link_url,
    slot: ad.slot
  }))
}

export function useAds() {
  return useSWR<ServedAd[]>('ncol-ads', fetchAllAds, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })
}

/** Pick a random ad for a given slot from the cached results. Returns null if none. */
export function pickAd(
  ads: ServedAd[] | undefined,
  slot: string
): ServedAd | null {
  if (!ads) return null
  const matching = ads.filter(a => a.slot === slot)
  if (matching.length === 0) return null
  // eslint-disable-next-line sonarjs/pseudo-random
  return matching[Math.floor(Math.random() * matching.length)]
}
