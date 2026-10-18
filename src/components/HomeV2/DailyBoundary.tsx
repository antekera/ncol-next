'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { homePublicationDay } from '@lib/homeV2/editorialPolicy'

// A single daily boundary covers server content and client caches. It also
// catches suspended mobile tabs when they become visible again.
export function DailyBoundary({
  day,
  children
}: {
  day: string
  children: ReactNode
}) {
  const router = useRouter()
  const [expiredDay, setExpiredDay] = useState<string | null>(null)
  useEffect(() => {
    let requested = false
    const check = () => {
      const current = homePublicationDay()
      if (current === day || requested) return
      requested = true
      setExpiredDay(day)
      router.refresh()
    }
    const midnight = new Date(`${day}T00:00:00-04:00`).getTime() + 86400000
    const timer = window.setTimeout(check, Math.max(0, midnight - Date.now()))
    window.addEventListener('focus', check)
    window.addEventListener('pageshow', check)
    document.addEventListener('visibilitychange', check)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('focus', check)
      window.removeEventListener('pageshow', check)
      document.removeEventListener('visibilitychange', check)
    }
  }, [day, router])
  return expiredDay !== day ? (
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
