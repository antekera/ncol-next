'use client'

import { useMemo, useState, useEffect } from 'react'
import useSWR from 'swr'
import { ADS_ENABLED } from '@lib/config'
import { getStorageItem, setStorageItem } from '@lib/utils/browserStorage'

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(
  /\/$/,
  ''
)
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export interface ServedAd {
  id: string
  type: 'banner' | 'html' | 'adsense' | 'third_party'
  imageUrl: string | null
  imageUrlMobile: string | null
  htmlContent: string | null
  linkUrl: string | null
  slot: string
  deviceTarget: 'all' | 'mobile' | 'desktop'
  unitId?: string
  providerKey?: string
  containerClass?: string
}

interface RawAd {
  id: string
  type: 'banner' | 'html'
  image_url: string | null
  image_url_mobile: string | null
  html_content: string | null
  link_url: string | null
  link_url_desktop: string | null
  link_url_ios: string | null
  link_url_android: string | null
  slot: string
  device_target: 'all' | 'mobile' | 'desktop'
}

interface RawSlotFallback {
  slot: string
  provider: string
  provider_key: string | null
  container_class: string | null
  unit_id: string | null
}

export function parseSlotFallbacks(
  rows: unknown,
  eligibleSlots: readonly string[]
): ServedAd[] {
  if (!Array.isArray(rows)) return []

  return rows.flatMap<ServedAd>((row: unknown) => {
    if (
      typeof row !== 'object' ||
      row === null ||
      !('slot' in row) ||
      !('provider' in row) ||
      !('provider_key' in row) ||
      !('container_class' in row) ||
      !('unit_id' in row)
    ) {
      return []
    }

    const setting = row as RawSlotFallback
    if (
      typeof setting.slot !== 'string' ||
      !eligibleSlots.includes(setting.slot)
    ) {
      return []
    }

    if (
      setting.provider === 'adsense' &&
      /^\d{10}$/.test(setting.unit_id ?? '')
    ) {
      return [
        {
          id: `adsense-${setting.slot}`,
          type: 'adsense',
          imageUrl: null,
          imageUrlMobile: null,
          htmlContent: null,
          linkUrl: null,
          slot: setting.slot,
          deviceTarget: 'all',
          unitId: setting.unit_id!
        }
      ]
    }

    if (
      setting.provider === 'third_party' &&
      typeof setting.provider_key === 'string' &&
      /^[a-z][a-z0-9_-]{0,31}$/.test(setting.provider_key) &&
      typeof setting.container_class === 'string' &&
      /^[A-Za-z_][A-Za-z0-9_-]{0,63}$/.test(setting.container_class)
    ) {
      return [
        {
          id: `third-party-${setting.slot}`,
          type: 'third_party',
          imageUrl: null,
          imageUrlMobile: null,
          htmlContent: null,
          linkUrl: null,
          slot: setting.slot,
          deviceTarget: 'all',
          providerKey: setting.provider_key,
          containerClass: setting.container_class
        }
      ]
    }

    return []
  })
}

const AD_SLOTS = [
  'header',
  'sidebar',
  'article-top',
  'article-bottom',
  'footer',
  'inline',
  'popup',
  'sticky-bottom'
]

type LinkableAd = Pick<
  RawAd,
  'link_url' | 'link_url_desktop' | 'link_url_ios' | 'link_url_android'
>

export function resolveAdLink(
  ad: LinkableAd,
  userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent
) {
  const isIos =
    /iPad|iPhone|iPod/i.test(userAgent) ||
    (/Macintosh/i.test(userAgent) && /Mobile/i.test(userAgent))

  if (isIos) {
    return ad.link_url_ios ?? ad.link_url_desktop ?? ad.link_url
  }
  if (/Android/i.test(userAgent)) {
    return ad.link_url_android ?? ad.link_url_desktop ?? ad.link_url
  }
  return ad.link_url_desktop ?? ad.link_url
}

async function fetchAllAds(): Promise<ServedAd[]> {
  if (!ADS_ENABLED || !SUPABASE_URL || !SUPABASE_ANON_KEY) return []
  const now = new Date().toISOString()
  const url =
    `${SUPABASE_URL}/rest/v1/ads` +
    `?select=id,type,image_url,image_url_mobile,html_content,link_url,link_url_desktop,link_url_ios,link_url_android,slot,device_target` +
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

  const directAds = data
    .filter(ad => ad.device_target === 'all' || ad.device_target === device)
    .map(ad => ({
      id: ad.id,
      type: ad.type,
      imageUrl: ad.image_url,
      imageUrlMobile: ad.image_url_mobile,
      htmlContent: ad.html_content,
      linkUrl: resolveAdLink(ad),
      slot: ad.slot,
      deviceTarget: ad.device_target
    }))

  const occupiedSlots = new Set(data.map(ad => ad.slot))
  const emptySlots = AD_SLOTS.filter(slot => !occupiedSlots.has(slot))
  if (emptySlots.length === 0) return directAds

  const settingsParams = new URLSearchParams({
    select: 'slot,provider,provider_key,container_class,unit_id',
    slot: `in.(${emptySlots.join(',')})`
  })
  let configuredFallbacks: ServedAd[] = []
  try {
    const settingsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/ad_slot_fallbacks_public?${settingsParams.toString()}`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    )
    if (settingsResponse.ok) {
      const settingsPayload: unknown = await settingsResponse.json()
      configuredFallbacks = parseSlotFallbacks(settingsPayload, emptySlots)
    }
  } catch {
    // Slot fallbacks are optional. A failed configuration request must not hide direct ads.
  }

  return [...directAds, ...configuredFallbacks]
}

const STORAGE_KEY = 'ncol_ads_nonce'

function getOrCreateNonce(): number {
  if (typeof window === 'undefined') return 0
  const stored = getStorageItem('session', STORAGE_KEY)
  const storedDate = getStorageItem('session', `${STORAGE_KEY}_date`)
  const today = new Date().toDateString()
  if (stored && storedDate === today) return Number(stored)
  const v = Date.now()
  setStorageItem('session', STORAGE_KEY, String(v))
  setStorageItem('session', `${STORAGE_KEY}_date`, today)
  return v
}

export function useAds() {
  const [nonce, setNonce] = useState(getOrCreateNonce)

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        const storedDate = getStorageItem('session', `${STORAGE_KEY}_date`)
        const today = new Date().toDateString()
        if (storedDate !== today) {
          const v = Date.now()
          setStorageItem('session', STORAGE_KEY, String(v))
          setStorageItem('session', `${STORAGE_KEY}_date`, today)
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
  const direct = matching.filter(
    ad => ad.type === 'banner' || ad.type === 'html'
  )
  const candidates = direct.length > 0 ? direct : matching
  // eslint-disable-next-line sonarjs/pseudo-random
  return candidates[Math.floor(Math.random() * candidates.length)]
}
