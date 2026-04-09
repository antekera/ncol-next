'use client'

import { useEffect, useRef, useState } from 'react'
import { useAds, pickAd } from '@lib/hooks/data/useAds'
import type { ServedAd } from '@lib/hooks/data/useAds'

function isMobile() {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

function getCount(k: string) {
  return parseInt(localStorage.getItem(k) ?? '0', 10)
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
  fetch('/api/track/', {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ad_id: adId,
      slot,
      date: today,
      views: v,
      clicks: c
    })
  }).catch(() => {})
}

// ── Standard slot ─────────────────────────────────────────────────────────────

interface NcolAdSlotProps {
  slot: string
  className?: string
}

export function NcolAdSlot({ slot, className }: NcolAdSlotProps) {
  const { data: ads } = useAds()
  const ad = pickAd(ads, slot)
  const [imgSrc, setImgSrc] = useState<string | null>(null)
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
    const today = new Date().toISOString().slice(0, 10)
    const kV = `ncol_v_${ad.id}_${today}`
    localStorage.setItem(kV, String(getCount(kV) + 1))
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
      <div className={className}>
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
    )
  }

  if (ad.type === 'html' && ad.htmlContent) {
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div
        className={className}
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: ad.htmlContent }}
      />
    )
  }

  return null
}

// ── Pop-up slot (shown 3 s after mount) ───────────────────────────────────────

export function NcolAdSlotPopup() {
  const slot = 'popup'
  const { data: ads } = useAds()
  const [ad, setAd] = useState<ServedAd | null>(null)
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)
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
      const today = new Date().toISOString().slice(0, 10)
      const kV = `ncol_v_${picked.id}_${today}`
      localStorage.setItem(kV, String(getCount(kV) + 1))
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
      </div>
    </div>
  )
}

// ── Sticky-bottom slot ────────────────────────────────────────────────────────

export function NcolAdSlotStickyBottom() {
  const slot = 'sticky-bottom'
  const { data: ads } = useAds()
  const ad = pickAd(ads, slot)
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [closed, setClosed] = useState(false)
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
    const today = new Date().toISOString().slice(0, 10)
    const kV = `ncol_v_${ad.id}_${today}`
    localStorage.setItem(kV, String(getCount(kV) + 1))
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
      {content}
    </div>
  )
}
