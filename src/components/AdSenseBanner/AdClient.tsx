'use client'

import { useEffect } from 'react'
import React from 'react'
import * as Sentry from '@sentry/browser'
import { usePathname, useSearchParams } from 'next/navigation'

export type AdUnitProps = {
  children: React.ReactNode
}

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>
  }
}

const AdClient = ({ children }: AdUnitProps) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    try {
      window.adsbygoogle = window.adsbygoogle || []
      window.adsbygoogle.push({})
    } catch (err) {
      Sentry.captureException(err)
    }
  }, [pathname, searchParams])
  return <>{children}</>
}

export { AdClient }
