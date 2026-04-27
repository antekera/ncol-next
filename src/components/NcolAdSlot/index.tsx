'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAds, pickAd } from '@lib/hooks/data/useAds'
import type { ServedAd } from '@lib/hooks/data/useAds'
import { RESERVE_HEADER_HEIGHT, ADS_TRACKING_ENABLED } from '@lib/config'

function isMobile() {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    setMobile(window.innerWidth < 768)
  }, [])
  return mobile
}

function getSlotHeight(slot: string, mobile: boolean) {
  // eslint-disable-next-line security/detect-object-injection
  const dims = SLOT_DIMENSIONS[slot]
  if (!dims) return undefined
  return mobile ? dims.mobile[1] : dims.desktop[1]
}

// Slot dimensions mirrored from ncol-ads-dashboard/src/lib/constants.ts SLOT_CONFIG
const SLOT_DIMENSIONS: Record<
  string,
  { desktop: [number, number]; mobile: [number, number] }
> = {
  header: { desktop: [970, 250], mobile: [300, 250] },
  sidebar: { desktop: [300, 600], mobile: [300, 250] },
  'article-top': { desktop: [728, 90], mobile: [320, 100] },
  'article-bottom': { desktop: [728, 90], mobile: [320, 100] },
  footer: { desktop: [970, 90], mobile: [320, 100] },
  inline: { desktop: [300, 250], mobile: [300, 250] },
  popup: { desktop: [900, 500], mobile: [320, 480] },
  'sticky-bottom': { desktop: [970, 90], mobile: [320, 100] }
}

function usePlaceholderMode() {
  const params = useSearchParams()
  return params?.has('ver-banners') ?? false
}

function getCount(k: string) {
  return parseInt(localStorage.getItem(k) ?? '0', 10)
}

interface TrackItem {
  adId: string
  slot: string
  date: string
  views: number
  clicks: number
}

async function sendBatchTrack(items: TrackItem[]) {
  try {
    const res = await fetch('/api/track/', {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ads: items.map(({ adId, slot, date, views, clicks }) => ({
          ad_id: adId,
          slot,
          date,
          views,
          clicks
        }))
      })
    })
    return res.ok
  } catch {
    return false
  }
}

let isFlushing = false

/** Collect all pending view/click counts from localStorage and send in one request. */
async function flushAll() {
  if (!ADS_TRACKING_ENABLED || isFlushing) return
  isFlushing = true
  try {
    const entries = new Map<
      string,
      {
        adId: string
        slot: string
        date: string
        views: number
        clicks: number
      }
    >()
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue
      const m = /^ncol_([vc])_(.+)_(\d{4}-\d{2}-\d{2})$/.exec(key)
      if (!m) continue
      const [, type, adId, date] = m
      const mapKey = `${adId}_${date}`
      if (!entries.has(mapKey)) {
        const slot = localStorage.getItem(`ncol_slot_${adId}`) ?? 'unknown'
        entries.set(mapKey, { adId, slot, date, views: 0, clicks: 0 })
      }
      const entry = entries.get(mapKey)!
      if (type === 'v') entry.views = getCount(key)
      else entry.clicks = getCount(key)
    }

    const toSend = [...entries.values()].filter(e => e.views + e.clicks > 0)
    if (toSend.length === 0) return

    const ok = await sendBatchTrack(toSend)
    if (ok) {
      for (const { adId, date } of toSend) {
        localStorage.removeItem(`ncol_v_${adId}_${date}`)
        localStorage.removeItem(`ncol_c_${adId}_${date}`)
      }
    }
  } finally {
    isFlushing = false
  }
}

// Register once per module load
if (typeof window !== 'undefined' && ADS_TRACKING_ENABLED) {
  void flushAll()
  document.addEventListener('visibilitychange', () => void flushAll())
  window.addEventListener('beforeunload', () => void flushAll())
}

function recordClick(adId: string) {
  if (!ADS_TRACKING_ENABLED) return
  const today = new Date().toISOString().slice(0, 10)
  const kC = `ncol_c_${adId}_${today}`
  localStorage.setItem(kC, String(getCount(kC) + 1))
  void flushAll()
}

/**
 * Returns a callback ref to attach to the ad container.
 * Increments the view counter once the element is ≥50% visible for ≥1 s.
 * Using a callback ref ensures the observer starts the moment the DOM element
 * mounts, avoiding the timing issue where useEffect runs before the element
 * is in the DOM (e.g. banner ads that wait for imgSrc to be set).
 */
function useViewTracking(ad: ServedAd | null | undefined) {
  const cleanupRef = useRef<(() => void) | null>(null)

  return useCallback(
    (el: HTMLElement | null) => {
      cleanupRef.current?.()
      cleanupRef.current = null
      if (!el || !ad) return

      let timer: ReturnType<typeof setTimeout> | null = null
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            timer = setTimeout(() => {
              if (ADS_TRACKING_ENABLED) {
                const today = new Date().toISOString().slice(0, 10)
                const kV = `ncol_v_${ad.id}_${today}`
                localStorage.setItem(kV, String(getCount(kV) + 1))
                localStorage.setItem(`ncol_slot_${ad.id}`, ad.slot)
              }
              timer = null
              observer.disconnect()
            }, 300)
          } else {
            if (timer) {
              clearTimeout(timer)
              timer = null
            }
          }
        },
        { threshold: 0.5 }
      )
      observer.observe(el)
      cleanupRef.current = () => {
        observer.disconnect()
        if (timer) {
          // Ad was visible when unmounting (navigation) — count the view immediately
          clearTimeout(timer)
          timer = null
          if (ADS_TRACKING_ENABLED) {
            const today = new Date().toISOString().slice(0, 10)
            const kV = `ncol_v_${ad.id}_${today}`
            localStorage.setItem(kV, String(getCount(kV) + 1))
            localStorage.setItem(`ncol_slot_${ad.id}`, ad.slot)
          }
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ad?.id]
  )
}

// ── Ad label ─────────────────────────────────────────────────────────────────

function AdLabel() {
  return (
    <span className='pointer-events-none absolute -top-4 left-0 z-[1] rounded-sm bg-white/85 px-1 py-0.5 text-[9px] leading-none tracking-[0.05em] text-gray-400 select-none'>
      PUBLICIDAD
    </span>
  )
}

// ── Placeholder ───────────────────────────────────────────────────────────────

interface PlaceholderProps {
  slot: string
  className?: string
  style?: React.CSSProperties
}

function NcolAdSlotPlaceholder({ slot, className, style }: PlaceholderProps) {
  const mobile = useIsMobile()
  const h = getSlotHeight(slot, mobile)
  // eslint-disable-next-line security/detect-object-injection
  const dims = SLOT_DIMENSIONS[slot]

  if (!dims) return null
  const [w, height] = mobile ? dims.mobile : dims.desktop
  const src = `https://placehold.co/${w}x${height}.png`
  return (
    <div
      className={className}
      style={{ ...style, minHeight: h ? `${h}px` : undefined }}
    >
      <div className='relative'>
        <AdLabel />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`Placeholder ${slot}`}
          width={w}
          height={height}
          className='block h-auto max-w-full'
        />
      </div>
    </div>
  )
}

// ── Standard slot ─────────────────────────────────────────────────────────────

interface NcolAdSlotProps {
  slot: string
  className?: string
  priority?: boolean
}

function usePickedAd(ads: ServedAd[] | undefined, slot: string) {
  const adRef = useRef<ServedAd | null | undefined>(undefined)
  if (adRef.current === undefined && ads !== undefined) {
    adRef.current = pickAd(ads, slot)
  }
  return adRef.current
}

function NcolAdSlotInner({ slot, className, priority }: NcolAdSlotProps) {
  const { data: ads } = useAds()
  const ad = usePickedAd(ads, slot)
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const viewRef = useViewTracking(ad)
  const mobile = useIsMobile()

  const reservedHeight =
    slot === 'header' && !RESERVE_HEADER_HEIGHT
      ? undefined
      : getSlotHeight(slot, mobile)

  useEffect(() => {
    if (!ad) return
    if (ad.type === 'banner') {
      const mob = isMobile()
      setImgSrc(mob ? (ad.imageUrlMobile ?? null) : (ad.imageUrl ?? null))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad?.id])

  useEffect(() => {
    if (!ad || ad.type !== 'banner') return
    if (ad.imageUrl === ad.imageUrlMobile) return
    let lastMobile = isMobile()
    function handleResize() {
      const nowMobile = isMobile()
      if (nowMobile !== lastMobile) {
        lastMobile = nowMobile
        setImgSrc(
          nowMobile ? (ad!.imageUrlMobile ?? null) : (ad!.imageUrl ?? null)
        )
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [ad])

  function handleClick() {
    if (ad) recordClick(ad.id)
  }

  if (!ad) {
    if (reservedHeight) {
      return (
        <div
          className={className}
          style={{ minHeight: `${reservedHeight}px` }}
        />
      )
    }
    return null
  }

  if (ad.type === 'banner' && imgSrc) {
    return (
      <div
        ref={viewRef}
        className={className}
        style={{
          minHeight: reservedHeight ? `${reservedHeight}px` : undefined
        }}
      >
        <div className='relative'>
          <AdLabel />
          <a
            href={ad.linkUrl ?? '#'}
            target='_blank'
            rel='noopener noreferrer'
            onClick={handleClick}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgSrc}
              alt=''
              className='block h-auto max-w-full'
              fetchPriority={priority ? 'high' : 'auto'}
            />
          </a>
        </div>
      </div>
    )
  }

  if (ad.type === 'html' && ad.htmlContent) {
    return (
      <div
        ref={viewRef}
        className={className}
        style={{
          minHeight: reservedHeight ? `${reservedHeight}px` : undefined
        }}
      >
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div className='relative' onClick={handleClick}>
          <AdLabel />
          <div dangerouslySetInnerHTML={{ __html: ad.htmlContent }} />
        </div>
      </div>
    )
  }

  return null
}

function NcolAdSlotResolved({ slot, className, priority }: NcolAdSlotProps) {
  const placeholder = usePlaceholderMode()
  if (placeholder)
    return <NcolAdSlotPlaceholder slot={slot} className={className} />
  return (
    <NcolAdSlotInner slot={slot} className={className} priority={priority} />
  )
}

export function NcolAdSlot({ slot, className, priority }: NcolAdSlotProps) {
  return (
    <Suspense fallback={null}>
      <NcolAdSlotResolved
        slot={slot}
        className={className}
        priority={priority}
      />
    </Suspense>
  )
}

// ── Pop-up slot (shown 3 s after mount) ───────────────────────────────────────

function NcolAdSlotPopupInner() {
  const slot = 'popup'
  const { data: ads } = useAds()
  const [ad, setAd] = useState<ServedAd | null>(null)
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const viewRef = useViewTracking(ad)
  const mobile = useIsMobile()

  useEffect(() => {
    const t = setTimeout(() => {
      const picked = pickAd(ads, slot)
      if (!picked) return
      setAd(picked)
      if (picked.type === 'banner') {
        const mob = isMobile()
        setImgSrc(
          mob ? (picked.imageUrlMobile ?? null) : (picked.imageUrl ?? null)
        )
      }
      setVisible(true)
    }, 3000)
    return () => clearTimeout(t)
  }, [ads])

  function handleClick() {
    if (ad) recordClick(ad.id)
  }

  if (!ad || !visible) return null

  const popupDims = mobile
    ? SLOT_DIMENSIONS['popup'].mobile
    : SLOT_DIMENSIONS['popup'].desktop
  const [popupW, popupH] = popupDims

  let content: React.ReactNode = null
  if (ad.type === 'banner' && imgSrc) {
    content = (
      <div
        style={{
          width: popupW,
          maxWidth: '100%',
          aspectRatio: `${popupW}/${popupH}`,
          position: 'relative'
        }}
      >
        {!imgLoaded && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#1a1a1a',
              borderRadius: 4
            }}
          />
        )}
        <a
          href={ad.linkUrl ?? '#'}
          target='_blank'
          rel='noopener noreferrer'
          onClick={handleClick}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt=''
            className='block h-auto max-w-full rounded'
            style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.2s' }}
            onLoad={() => setImgLoaded(true)}
          />
        </a>
      </div>
    )
  } else if (ad.type === 'html' && ad.htmlContent) {
    content = (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: ad.htmlContent }}
      />
    )
  }

  if (!content) return null

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className='fixed inset-0 z-[99999] flex items-center justify-center bg-black/[0.72]'
      onClick={e => {
        if (e.target === e.currentTarget) setVisible(false)
      }}
    >
      <div ref={viewRef} className='relative box-border max-w-full px-3'>
        <button
          onClick={() => setVisible(false)}
          aria-label='Cerrar anuncio'
          className='absolute -top-3.5 right-1.5 z-[1] flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-none bg-white text-xl leading-none shadow-[0_2px_6px_rgba(0,0,0,0.3)]'
        >
          &times;
        </button>
        {content}
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          onClick={() => setVisible(false)}
          className='w-full cursor-pointer bg-[#333] py-2.5 text-center text-[13px] text-white select-none'
        >
          Cerrar anuncio
        </div>
      </div>
    </div>
  )
}

function NcolAdSlotPopupPlaceholder() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(t)
  }, [])

  const mobile = useIsMobile()

  if (!visible) return null

  const dims = SLOT_DIMENSIONS['popup']
  const [w, h] = mobile ? dims.mobile : dims.desktop
  const src = `https://placehold.co/${w}x${h}.png`

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className='fixed inset-0 z-[99999] flex items-center justify-center bg-black/[0.72]'
      onClick={e => {
        if (e.target === e.currentTarget) setVisible(false)
      }}
    >
      <div className='relative box-border max-w-full px-3'>
        <button
          onClick={() => setVisible(false)}
          aria-label='Cerrar anuncio'
          className='absolute -top-3.5 right-1.5 z-[1] flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-none bg-white text-xl leading-none shadow-[0_2px_6px_rgba(0,0,0,0.3)]'
        >
          &times;
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt='Placeholder popup'
          width={w}
          height={h}
          className='block h-auto max-w-full rounded'
        />
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          onClick={() => setVisible(false)}
          className='w-full cursor-pointer bg-[#333] py-2.5 text-center text-[13px] text-white select-none'
        >
          Cerrar anuncio
        </div>
      </div>
    </div>
  )
}

function NcolAdSlotPopupResolved() {
  const placeholder = usePlaceholderMode()
  if (placeholder) return <NcolAdSlotPopupPlaceholder />
  return <NcolAdSlotPopupInner />
}

export function NcolAdSlotPopup() {
  return (
    <Suspense fallback={null}>
      <NcolAdSlotPopupResolved />
    </Suspense>
  )
}

// ── Sticky-bottom slot ────────────────────────────────────────────────────────

function NcolAdSlotStickyBottomInner() {
  const slot = 'sticky-bottom'
  const { data: ads } = useAds()
  const ad = usePickedAd(ads, slot)
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [closed, setClosed] = useState(false)
  const viewRef = useViewTracking(ad)

  useEffect(() => {
    if (!ad) return
    if (ad.type === 'banner') {
      const mob = isMobile()
      setImgSrc(mob ? (ad.imageUrlMobile ?? null) : (ad.imageUrl ?? null))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad?.id])

  useEffect(() => {
    if (!ad || ad.type !== 'banner') return
    if (ad.imageUrl === ad.imageUrlMobile) return
    let lastMobile = isMobile()
    // eslint-disable-next-line sonarjs/no-identical-functions
    function handleResize() {
      const nowMobile = isMobile()
      if (nowMobile !== lastMobile) {
        lastMobile = nowMobile
        setImgSrc(
          nowMobile ? (ad!.imageUrlMobile ?? null) : (ad!.imageUrl ?? null)
        )
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [ad])

  function handleClick() {
    if (ad) recordClick(ad.id)
  }

  if (!ad || closed) return null

  let content: React.ReactNode = null
  if (ad.type === 'banner' && imgSrc) {
    content = (
      <a
        href={ad.linkUrl ?? '#'}
        target='_blank'
        rel='noopener noreferrer'
        onClick={handleClick}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgSrc} alt='' className='block h-auto max-w-full' />
      </a>
    )
  } else if (ad.type === 'html' && ad.htmlContent) {
    content = (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: ad.htmlContent }}
      />
    )
  }

  if (!content) return null

  return (
    <div
      ref={viewRef}
      className='fixed bottom-0 left-1/2 z-[99998] flex w-max -translate-x-1/2 flex-col items-end [transition:transform_0.4s_ease]'
    >
      <div className='flex justify-end'>
        <button
          onClick={() => setClosed(true)}
          aria-label='Cerrar anuncio'
          className='cursor-pointer rounded-t border-none bg-white px-2 py-1 text-[11px] leading-[1.4] text-[#888]'
        >
          Cerrar anuncio ×
        </button>
      </div>
      <div className='relative'>
        <AdLabel />
        {content}
      </div>
    </div>
  )
}

function NcolAdSlotStickyBottomPlaceholder() {
  const [closed, setClosed] = useState(false)
  const mobile = useIsMobile()
  if (closed) return null

  const dims = SLOT_DIMENSIONS['sticky-bottom']
  const [w, h] = mobile ? dims.mobile : dims.desktop
  const src = `https://placehold.co/${w}x${h}.png`

  return (
    <div className='fixed bottom-0 left-1/2 z-[99998] flex w-max -translate-x-1/2 flex-col items-end'>
      <div className='flex justify-end'>
        <button
          onClick={() => setClosed(true)}
          aria-label='Cerrar anuncio'
          className='cursor-pointer rounded-t border-none bg-white px-2 py-1 text-[11px] leading-[1.4] text-[#888]'
        >
          Cerrar anuncio ×
        </button>
      </div>
      <div className='relative'>
        <AdLabel />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt='Placeholder sticky-bottom'
          width={w}
          height={h}
          className='block h-auto'
        />
      </div>
    </div>
  )
}

function NcolAdSlotStickyBottomResolved() {
  const placeholder = usePlaceholderMode()
  if (placeholder) return <NcolAdSlotStickyBottomPlaceholder />
  return <NcolAdSlotStickyBottomInner />
}

export function NcolAdSlotStickyBottom() {
  return (
    <Suspense fallback={null}>
      <NcolAdSlotStickyBottomResolved />
    </Suspense>
  )
}
