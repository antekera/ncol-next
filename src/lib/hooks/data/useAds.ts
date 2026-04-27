'use client'

import { useMemo, useState, useEffect } from 'react'
import useSWR from 'swr'
import { ADS_ENABLED } from '@lib/config'

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
  deviceTarget: 'all' | 'mobile' | 'desktop'
}

interface RawAd {
  id: string
  type: 'banner' | 'html'
  image_url: string | null
  image_url_mobile: string | null
  html_content: string | null
  link_url: string | null
  slot: string
  device_target: 'all' | 'mobile' | 'desktop'
}

async function fetchAllAds(): Promise<ServedAd[]> {
  if (!ADS_ENABLED || !SUPABASE_URL || !SUPABASE_ANON_KEY) return []
  const now = new Date().toISOString()
  const url =
    `${SUPABASE_URL}/rest/v1/ads` +
    `?select=id,type,image_url,image_url_mobile,html_content,link_url,slot,device_target` +
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
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const device = isMobile ? 'mobile' : 'desktop'

  return data
    .filter(ad => ad.device_target === 'all' || ad.device_target === device)
    .map(ad => ({
      id: ad.id,
      type: ad.type,
      imageUrl: ad.image_url,
      imageUrlMobile: ad.image_url_mobile,
      htmlContent: ad.html_content,
      linkUrl: ad.link_url,
      slot: ad.slot,
      deviceTarget: ad.device_target
    }))
}

const STORAGE_KEY = 'ncol_ads_nonce'

function getOrCreateNonce(): number {
  if (typeof window === 'undefined') return 0
  const stored = window.sessionStorage.getItem(STORAGE_KEY)
  const storedDate = window.sessionStorage.getItem(`${STORAGE_KEY}_date`)
  const today = new Date().toDateString()
  if (stored && storedDate === today) return Number(stored)
  const v = Date.now()
  window.sessionStorage.setItem(STORAGE_KEY, String(v))
  window.sessionStorage.setItem(`${STORAGE_KEY}_date`, today)
  return v
}

export function useAds() {
  const [nonce, setNonce] = useState(getOrCreateNonce)

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        const storedDate = window.sessionStorage.getItem(`${STORAGE_KEY}_date`)
        const today = new Date().toDateString()
        if (storedDate !== today) {
          const v = Date.now()
          window.sessionStorage.setItem(STORAGE_KEY, String(v))
          window.sessionStorage.setItem(`${STORAGE_KEY}_date`, today)
          setNonce(v)
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('focus', handleVisibility)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', handleVisibility)
    }
  }, [])

  const key = useMemo(() => `ncol-ads_${nonce}`, [nonce])

  return useSWR<ServedAd[]>(key, fetchAllAds, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    dedupingInterval: 60 * 60 * 1000
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
