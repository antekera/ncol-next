import React, { ReactNode, Suspense } from 'react'
import { AdClient } from '@components/AdSenseBanner/AdClient'
import { isProd } from '@lib/utils/env'
import { getAdSenseBannerClasses } from './styles'

interface AdSenseBannerProps {
  data?: {
    'data-ad-layout-key'?: string
    'data-ad-format': string
    'data-ad-layout'?: string
    'data-ad-slot': string
    'data-full-width-responsive'?: string
  }
  className?: string
}

const AdUnit = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense>
      {isProd ? <AdClient>{children}</AdClient> : <>{children}</>}
    </Suspense>
  )
}

const AdSenseBanner = ({ className, data }: AdSenseBannerProps) => {
  const classes = getAdSenseBannerClasses(className)
  if (!data) return null

  return (
    <AdUnit>
      <div
        className={classes}

      >
        <ins
          className='adsbygoogle'
          data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUB_ID}
          style={{ display: 'block', textAlign: 'center' }}
          {...data}
        />
      </div>
    </AdUnit>
  )
}

export { AdSenseBanner }
