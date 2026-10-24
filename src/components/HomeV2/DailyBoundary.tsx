'use client'

import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  type ReactNode
} from 'react'
import { homeEditorialDay } from '@lib/homeV2/editorialPolicy'

const Clock = createContext<number | null>(null)
const EditorialDay = createContext<string | null>(null)
export function useEditorialDay() {
  return useContext(EditorialDay) ?? homeEditorialDay()
}

/** One local timer; server-rendered alternatives remain available even when
 * refreshing the route would return the same cached HTML/RSC. */
export function DailyBoundary({
  initialNow,
  deadlines,
  children
}: {
  initialNow: number
  deadlines: readonly number[]
  children: ReactNode
}) {
  const [now, setNow] = useState(initialNow)
  const day = homeEditorialDay(new Date(now))
  const next = Math.min(
    Date.parse(`${day}T00:00:00-04:00`) + 86400000,
    ...deadlines.filter(at => at > now)
  )
  useLayoutEffect(() => {
    const check = () => {
      const current = Date.now()
      if (current >= next || homeEditorialDay(new Date(current)) !== day)
        setNow(current)
    }
    check()
    const timer = window.setTimeout(check, Math.max(0, next - Date.now()))
    window.addEventListener('focus', check)
    window.addEventListener('pageshow', check)
    document.addEventListener('visibilitychange', check)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('focus', check)
      window.removeEventListener('pageshow', check)
      document.removeEventListener('visibilitychange', check)
    }
  }, [day, next])
  return (
    <EditorialDay.Provider value={day}>
      <Clock.Provider value={now}>{children}</Clock.Provider>
    </EditorialDay.Provider>
  )
}

export function EditorialRoot({
  className,
  children
}: {
  className: string
  children: ReactNode
}) {
  const day = useEditorialDay()
  return (
    <div className={className} data-home-variant='v2' data-editorial-day={day}>
      {children}
    </div>
  )
}
export interface EditorialVersion {
  at: number
  content: ReactNode
}
export function EditorialSlot({
  versions
}: {
  versions: readonly EditorialVersion[]
}) {
  const now = useContext(Clock) ?? Date.now()
  for (let index = versions.length - 1; index >= 0; index--)
    if (versions[index].at <= now) return versions[index].content
  return versions[0]?.content ?? null
}
