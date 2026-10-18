'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { homeEditorialDay } from '@lib/homeV2/editorialPolicy'

// One timer covers title dates and the next manual-feature expiry, including
// suspended mobile tabs when they become visible again. No polling is needed.
export function DailyBoundary({
  day,
  expiresAt,
  children
}: {
  day: string
  expiresAt?: number
  children: ReactNode
}) {
  const router = useRouter()
  const midnight = new Date(`${day}T00:00:00-04:00`).getTime() + 86400000
  const deadline = Math.min(midnight, expiresAt ?? midnight)
  const [expiredDeadline, setExpiredDeadline] = useState<number | null>(null)
  useEffect(() => {
    let requested = false
    const check = () => {
      const current = homeEditorialDay()
      if ((current === day && Date.now() < deadline) || requested) return
      requested = true
      setExpiredDeadline(deadline)
      router.refresh()
    }
    const timer = window.setTimeout(check, Math.max(0, deadline - Date.now()))
    window.addEventListener('focus', check)
    window.addEventListener('pageshow', check)
    document.addEventListener('visibilitychange', check)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('focus', check)
      window.removeEventListener('pageshow', check)
      document.removeEventListener('visibilitychange', check)
    }
  }, [day, deadline, router])
  return expiredDeadline !== deadline ? (
    children
  ) : (
    <p role='status'>
      Actualizando las noticias de hoy…{' '}
      <button type='button' onClick={() => window.location.reload()}>
        Recargar portada
      </button>
    </p>
  )
}
