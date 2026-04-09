'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAds, pickAd } from '@lib/hooks/data/useAds'
import type { ServedAd } from '@lib/hooks/data/useAds'

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

// Slot dimensions mirrored from ncol-ads-dashboard/src/lib/constants.ts SLOT_CONFIG
const SLOT_DIMENSIONS: Record<
  string,
  { desktop: [number, number]; mobile: [number, number] }
> = {
  header: { desktop: [970, 250], mobile: [320, 50] },
  sidebar: { desktop: [300, 600], mobile: [300, 250] },
  'article-top': { desktop: [728, 90], mobile: [320, 50] },
  'article-bottom': { desktop: [728, 90], mobile: [320, 50] },
  footer: { desktop: [970, 90], mobile: [320, 50] },
  inline: { desktop: [300, 250], mobile: [300, 250] },
  popup: { desktop: [900, 500], mobile: [320, 480] },
  'sticky-bottom': { desktop: [970, 90], mobile: [320, 50] }
}

function usePlaceholderMode() {
  const params = useSearchParams()
  return params?.has('ver-banners') ?? false
}

function getCount(k: string) {
  return parseInt(localStorage.getItem(k) ?? '0', 10)
}

function sendTrack(
  adId: string,
  slot: string,
  date: string,
  views: number,
  clicks: number
) {
  fetch('/api/track/', {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ad_id: adId, slot, date, views, clicks })
  }).catch(() => {})
}

function flush(adId: string, slot: string) {
  const today = new Date().toISOString().slice(0, 10)
  const kV = `ncol_v_${adId}_${today}`
  const kC = `ncol_c_${adId}_${today}`
  const v = getCount(kV)
  const c = getCount(kC)
  if (v + c === 0) return
  localStorage.removeItem(kV)
  localStorage.removeItem(kC)
  sendTrack(adId, slot, today, v, c)
}

/** Flush any view/click counts from previous days left in localStorage.
 *  Called on mount and when the tab becomes visible — covers the mobile case
 *  where the browser tab is never closed and the user returns the next day. */
function flushStaleEntries() {
  const today = new Date().toISOString().slice(0, 10)
  const stale = new Map<string, { adId: string; date: string }>()
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key) continue
    const m = /^ncol_[vc]_(.+)_(\d{4}-\d{2}-\d{2})$/.exec(key)
    if (!m || m[2] === today) continue
    stale.set(`${m[1]}_${m[2]}`, { adId: m[1], date: m[2] })
  }
  stale.forEach(({ adId, date }) => {
    const kV = `ncol_v_${adId}_${date}`
    const kC = `ncol_c_${adId}_${date}`
    const kS = `ncol_slot_${adId}`
    const v = getCount(kV)
    const c = getCount(kC)
    const slot = localStorage.getItem(kS) ?? 'unknown'
    localStorage.removeItem(kV)
    localStorage.removeItem(kC)
    if (v + c > 0) sendTrack(adId, slot, date, v, c)
  })
}

// Run once per module load (covers hard refreshes and first visits)
if (typeof window !== 'undefined') {
  flushStaleEntries()
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') flushStaleEntries()
  })
}

/**
 * Returns a callback ref to attach to the ad container.
 * Increments the view counter once the element is ≥50% visible for ≥1 s.
 * Using a callback ref ensures the observer starts the moment the DOM element
 * mounts, avoiding the timing issue where useEffect runs before the element
 * is in the DOM (e.g. banner ads that wait for imgSrc to be set).
 */
function useViewTracking(ad: ServedAd | null) {
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
              const today = new Date().toISOString().slice(0, 10)
              const kV = `ncol_v_${ad.id}_${today}`
              localStorage.setItem(kV, String(getCount(kV) + 1))
              localStorage.setItem(`ncol_slot_${ad.id}`, ad.slot)
              observer.disconnect()
            }, 1000)
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
        if (timer) clearTimeout(timer)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ad?.id]
  )
}

// ── Ad label ─────────────────────────────────────────────────────────────────

function AdLabel() {
  return (
    <span
      style={{
        position: 'absolute',
        top: 4,
        left: 4,
        fontSize: 9,
        lineHeight: 1,
        color: '#999',
        background: 'rgba(255,255,255,0.85)',
        padding: '2px 4px',
        borderRadius: 2,
        letterSpacing: '0.05em',
        pointerEvents: 'none',
        zIndex: 1,
        userSelect: 'none'
      }}
    >
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
  const dims = SLOT_DIMENSIONS[slot]
  if (!dims) return null
  const [w, h] = mobile ? dims.mobile : dims.desktop
  const src = `https://placehold.co/${w}x${h}.png`
  return (
    <div className={className} style={style}>
      <div style={{ position: 'relative' }}>
        <AdLabel />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`Placeholder ${slot}`}
          width={w}
          height={h}
          style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
        />
      </div>
    </div>
  )
}

// ── Standard slot ─────────────────────────────────────────────────────────────

interface NcolAdSlotProps {
  slot: string
  className?: string
}

function NcolAdSlotInner({ slot, className }: NcolAdSlotProps) {
  const { data: ads } = useAds()
  const ad = pickAd(ads, slot)
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const viewRef = useViewTracking(ad)
  const flushedRef = useRef(false)

  useEffect(() => {
    if (!ad) return
    if (ad.type === 'banner') {
      const mobile = isMobile()
      setImgSrc(
        mobile
          ? (ad.imageUrlMobile ?? ad.imageUrl)
          : (ad.imageUrl ?? ad.imageUrlMobile)
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad?.id])

  useEffect(() => {
    if (!ad || ad.type !== 'banner') return
    if (!ad.imageUrl || !ad.imageUrlMobile || ad.imageUrl === ad.imageUrlMobile)
      return
    let lastMobile = isMobile()
    function handleResize() {
      const nowMobile = isMobile()
      if (nowMobile !== lastMobile) {
        lastMobile = nowMobile
        setImgSrc(nowMobile ? ad!.imageUrlMobile : ad!.imageUrl)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [ad])

  useEffect(() => {
    if (!ad) return
    function handleHide() {
      if (document.visibilityState === 'hidden' && !flushedRef.current) {
        flushedRef.current = true
        flush(ad!.id, slot)
      }
    }
    function handleUnload() {
      flush(ad!.id, slot)
    }
    document.addEventListener('visibilitychange', handleHide)
    window.addEventListener('beforeunload', handleUnload)
    return () => {
      document.removeEventListener('visibilitychange', handleHide)
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [ad, slot])

  function handleClick() {
    if (!ad) return
    const today = new Date().toISOString().slice(0, 10)
    const kC = `ncol_c_${ad.id}_${today}`
    localStorage.setItem(kC, String(getCount(kC) + 1))
    flush(ad.id, slot)
  }

  if (!ad) return null

  if (ad.type === 'banner' && imgSrc) {
    return (
      <div ref={viewRef} className={className}>
        <div style={{ position: 'relative' }}>
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
              style={{ maxWidth: '100%', display: 'block', height: 'auto' }}
            />
          </a>
        </div>
      </div>
    )
  }

  if (ad.type === 'html' && ad.htmlContent) {
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div ref={viewRef} className={className} onClick={handleClick}>
        <div style={{ position: 'relative' }}>
          <AdLabel />
          <div dangerouslySetInnerHTML={{ __html: ad.htmlContent }} />
        </div>
      </div>
    )
  }

  return null
}

function NcolAdSlotResolved({ slot, className }: NcolAdSlotProps) {
  const placeholder = usePlaceholderMode()
  if (placeholder)
    return <NcolAdSlotPlaceholder slot={slot} className={className} />
  return <NcolAdSlotInner slot={slot} className={className} />
}

export function NcolAdSlot({ slot, className }: NcolAdSlotProps) {
  return (
    <Suspense fallback={null}>
      <NcolAdSlotResolved slot={slot} className={className} />
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
  const viewRef = useViewTracking(ad)
  const flushedRef = useRef(false)

  useEffect(() => {
    const t = setTimeout(() => {
      const picked = pickAd(ads, slot)
      if (!picked) return
      setAd(picked)
      if (picked.type === 'banner') {
        const mobile = isMobile()
        setImgSrc(
          mobile
            ? (picked.imageUrlMobile ?? picked.imageUrl)
            : (picked.imageUrl ?? picked.imageUrlMobile)
        )
      }
      setVisible(true)
    }, 3000)
    return () => clearTimeout(t)
  }, [ads])

  useEffect(() => {
    if (!ad) return
    // eslint-disable-next-line sonarjs/no-identical-functions
    function handleHide() {
      if (document.visibilityState === 'hidden' && !flushedRef.current) {
        flushedRef.current = true
        flush(ad!.id, slot)
      }
    }

    function handleUnload() {
      flush(ad!.id, slot)
    }
    document.addEventListener('visibilitychange', handleHide)
    window.addEventListener('beforeunload', handleUnload)
    return () => {
      document.removeEventListener('visibilitychange', handleHide)
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [ad])

  // eslint-disable-next-line sonarjs/no-identical-functions
  function handleClick() {
    if (!ad) return
    const today = new Date().toISOString().slice(0, 10)
    const kC = `ncol_c_${ad.id}_${today}`
    localStorage.setItem(kC, String(getCount(kC) + 1))
    flush(ad.id, slot)
  }

  if (!ad || !visible) return null

  const content =
    ad.type === 'banner' && imgSrc ? (
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
          style={{
            maxWidth: '100%',
            display: 'block',
            height: 'auto',
            borderRadius: 4
          }}
        />
      </a>
    ) : // eslint-disable-next-line sonarjs/no-nested-conditional
    ad.type === 'html' && ad.htmlContent ? (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: ad.htmlContent }}
      />
    ) : null

  if (!content) return null

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.72)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={e => {
        if (e.target === e.currentTarget) setVisible(false)
      }}
    >
      <div
        ref={viewRef}
        style={{
          position: 'relative',
          maxWidth: '100%',
          padding: '0 12px',
          boxSizing: 'border-box'
        }}
      >
        <button
          onClick={() => setVisible(false)}
          aria-label='Cerrar anuncio'
          style={{
            position: 'absolute',
            top: -14,
            right: 6,
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: '#fff',
            border: 'none',
            fontSize: 20,
            lineHeight: 1,
            cursor: 'pointer',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
          }}
        >
          &times;
        </button>
        {content}
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          onClick={() => setVisible(false)}
          style={{
            width: '100%',
            background: '#333',
            color: '#fff',
            textAlign: 'center',
            fontSize: 13,
            padding: '10px 0',
            cursor: 'pointer',
            userSelect: 'none'
          }}
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
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.72)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={e => {
        if (e.target === e.currentTarget) setVisible(false)
      }}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '100%',
          padding: '0 12px',
          boxSizing: 'border-box'
        }}
      >
        <button
          onClick={() => setVisible(false)}
          aria-label='Cerrar anuncio'
          style={{
            position: 'absolute',
            top: -14,
            right: 6,
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: '#fff',
            border: 'none',
            fontSize: 20,
            lineHeight: 1,
            cursor: 'pointer',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
          }}
        >
          &times;
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt='Placeholder popup'
          width={w}
          height={h}
          style={{
            display: 'block',
            maxWidth: '100%',
            height: 'auto',
            borderRadius: 4
          }}
        />
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          onClick={() => setVisible(false)}
          style={{
            width: '100%',
            background: '#333',
            color: '#fff',
            textAlign: 'center',
            fontSize: 13,
            padding: '10px 0',
            cursor: 'pointer',
            userSelect: 'none'
          }}
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
  const ad = pickAd(ads, slot)
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [closed, setClosed] = useState(false)
  const viewRef = useViewTracking(ad)
  const flushedRef = useRef(false)

  useEffect(() => {
    if (!ad) return
    if (ad.type === 'banner') {
      const mobile = isMobile()
      setImgSrc(
        mobile
          ? (ad.imageUrlMobile ?? ad.imageUrl)
          : (ad.imageUrl ?? ad.imageUrlMobile)
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad?.id])

  useEffect(() => {
    if (!ad || ad.type !== 'banner') return
    if (!ad.imageUrl || !ad.imageUrlMobile || ad.imageUrl === ad.imageUrlMobile)
      return
    let lastMobile = isMobile()
    // eslint-disable-next-line sonarjs/no-identical-functions
    function handleResize() {
      const nowMobile = isMobile()
      if (nowMobile !== lastMobile) {
        lastMobile = nowMobile
        setImgSrc(nowMobile ? ad!.imageUrlMobile : ad!.imageUrl)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [ad])

  useEffect(() => {
    if (!ad) return
    // eslint-disable-next-line sonarjs/no-identical-functions
    function handleHide() {
      if (document.visibilityState === 'hidden' && !flushedRef.current) {
        flushedRef.current = true
        flush(ad!.id, slot)
      }
    }

    function handleUnload() {
      flush(ad!.id, slot)
    }
    document.addEventListener('visibilitychange', handleHide)
    window.addEventListener('beforeunload', handleUnload)
    return () => {
      document.removeEventListener('visibilitychange', handleHide)
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [ad])

  // eslint-disable-next-line sonarjs/no-identical-functions
  function handleClick() {
    if (!ad) return
    const today = new Date().toISOString().slice(0, 10)
    const kC = `ncol_c_${ad.id}_${today}`
    localStorage.setItem(kC, String(getCount(kC) + 1))
    flush(ad.id, slot)
  }

  if (!ad || closed) return null

  const content =
    ad.type === 'banner' && imgSrc ? (
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
          style={{ maxWidth: '100%', display: 'block', height: 'auto' }}
        />
      </a>
    ) : // eslint-disable-next-line sonarjs/no-nested-conditional
    ad.type === 'html' && ad.htmlContent ? (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: ad.htmlContent }}
      />
    ) : null

  if (!content) return null

  return (
    <div
      ref={viewRef}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        zIndex: 99998,
        background: '#fff',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.18)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transition: 'transform 0.4s ease',
        transform: 'translateY(0)'
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '2px 8px 0',
          boxSizing: 'border-box'
        }}
      >
        <button
          onClick={() => setClosed(true)}
          aria-label='Cerrar anuncio'
          style={{
            background: 'none',
            border: 'none',
            fontSize: 11,
            cursor: 'pointer',
            color: '#888',
            padding: '2px 4px',
            lineHeight: 1.4
          }}
        >
          Cerrar anuncio ×
        </button>
      </div>
      <div style={{ position: 'relative' }}>
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
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        zIndex: 99998,
        background: '#fff',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.18)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '2px 8px 0',
          boxSizing: 'border-box'
        }}
      >
        <button
          onClick={() => setClosed(true)}
          aria-label='Cerrar anuncio'
          style={{
            background: 'none',
            border: 'none',
            fontSize: 11,
            cursor: 'pointer',
            color: '#888',
            padding: '2px 4px',
            lineHeight: 1.4
          }}
        >
          Cerrar anuncio ×
        </button>
      </div>
      <div style={{ position: 'relative' }}>
        <AdLabel />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt='Placeholder sticky-bottom'
          width={w}
          height={h}
          style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
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
