'use client'

import { GoogleTagManager } from '@next/third-parties/google'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface DeferredGoogleTagManagerProps {
  gtmId: string
}

function getDelay(pathname: string, isMobile: boolean) {
  if (pathname === '/' && isMobile) return 5000
  if (pathname === '/') return 2500
  if (isMobile) return 3000
  return 1500
}

export function DeferredGoogleTagManager({
  gtmId
}: DeferredGoogleTagManagerProps) {
  const pathname = usePathname()
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let idleId: number | null = null

    const isMobile = window.innerWidth < 768
    const delay = getDelay(pathname, isMobile)

    const enable = () => {
      if (!cancelled) setEnabled(true)
    }

    const enableAndCleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      if (idleId !== null && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId)
        idleId = null
      }
      window.removeEventListener('scroll', enableAndCleanup)
      window.removeEventListener('pointerdown', enableAndCleanup)
      window.removeEventListener('keydown', enableAndCleanup)
      enable()
    }

    timeoutId = setTimeout(enableAndCleanup, delay)

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(enableAndCleanup, {
        timeout: delay
      })
    }

    window.addEventListener('scroll', enableAndCleanup, { once: true })
    window.addEventListener('pointerdown', enableAndCleanup, { once: true })
    window.addEventListener('keydown', enableAndCleanup, { once: true })

    return () => {
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
      if (idleId !== null && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId)
      }
      window.removeEventListener('scroll', enableAndCleanup)
      window.removeEventListener('pointerdown', enableAndCleanup)
      window.removeEventListener('keydown', enableAndCleanup)
    }
  }, [pathname])

  if (!enabled) return null

  return <GoogleTagManager gtmId={gtmId} />
}
