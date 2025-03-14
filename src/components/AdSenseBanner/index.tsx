'use client'

import { useEffect } from 'react'

import * as Sentry from '@sentry/browser'

import { cn } from '@lib/shared'
import { isProd } from '@lib/utils/env'

interface AdSenseBannerProps {
  className?: string
}

const AdSenseBanner = ({ className }: AdSenseBannerProps) => {
  const classes = cn('adsbygoogle adbanner-customize', className)

  useEffect(() => {
    if (!isProd()) return
    try {
      window.adsbygoogle = window.adsbygoogle || []
      window.adsbygoogle.push({})
    } catch (err) {
      Sentry.captureException(err)
    }
  }, [])

  if (!isProd()) return null

  return (
    <ins
      className={classes}
      style={{ display: 'block' }}
      data-ad-format='autorelaxed'
      data-ad-client='ca-pub-6715059182926587'
      data-ad-slot='2581285869'
    />
  )
}

export { AdSenseBanner }
