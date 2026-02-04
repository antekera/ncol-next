'use client'

import { useEffect } from 'react'
import React from 'react'
import * as Sentry from '@sentry/browser'

export type AdUnitProps = {
  children: React.ReactNode
}

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>
  }
}

const AdClient = ({ children }: AdUnitProps) => {
  useEffect(() => {
    try {
      window.adsbygoogle = window.adsbygoogle || []
      window.adsbygoogle.push({})
    } catch (err: unknown) {
      let message = ''
      if (err instanceof Error) {
        message = err.message
      } else if (typeof err === 'string') {
        message = err
      }

      // Suppress known AdSense errors that are not critical
      if (
        message.includes('adsbygoogle.push() error') ||
        message.includes('No slot size') ||
        message.includes('already have ads')
      ) {
        return
      }
      Sentry.captureException(err)
    }
  }, [])
  return <>{children}</>
}

export { AdClient }
