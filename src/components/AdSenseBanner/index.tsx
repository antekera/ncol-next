import React, { ReactNode, Suspense } from 'react'
import { AdClient } from '@components/AdSenseBanner/AdClient'
import { isProd } from '@lib/utils/env'
import { cn } from '@lib/shared'

interface AdSenseBannerProps {
  data: {
    'data-ad-layout-key'?: string
    'data-ad-format': string
    'data-ad-layout'?: string
    'data-ad-slot': string
    'data-full-width-responsive'?: string
  }
  style?: React.CSSProperties
  className?: string
}

const AdUnit = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense>
      {isProd ? <AdClient>{children}</AdClient> : <>{children}</>}
    </Suspense>
  )
}

const AdSenseBanner = ({ className, style, data }: AdSenseBannerProps) => {
  if (!data) return null

  return (
    <AdUnit>
      <div
        className={cn({ 'adsense-banner': isProd }, className)}
        style={{
          ...style,
          background: !isProd ? '#f0f0f0 p-4' : 'transparent'
        }}
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