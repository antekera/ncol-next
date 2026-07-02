'use client'

import { useEffect, useState } from 'react'

interface DeferredRenderProps {
  children: React.ReactNode
  timeoutMs?: number
}

export function DeferredRender({
  children,
  timeoutMs = 1500
}: DeferredRenderProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const finish = () => {
      if (!cancelled) setReady(true)
    }

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(finish, { timeout: timeoutMs })
      return () => {
        cancelled = true
        window.cancelIdleCallback(idleId)
      }
    }

    timeoutId = setTimeout(finish, timeoutMs)

    return () => {
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [timeoutMs])

  if (!ready) return null

  return <>{children}</>
}
