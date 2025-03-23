import React, { ReactNode, Suspense } from 'react'
import { AdClient } from '@components/AdSenseBanner/AdClient'
import { cn } from '@lib/shared'
import { isDev, isProd } from '@lib/utils/env'

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
  const classes = cn('adsbygoogle adbanner-customize', className)
  if (!data) return null

  return (
    <AdUnit>
      <div
        className={classes}
        style={{
          ...style,
          ...(isDev
            ? {
                width: '100%',
                height: '200px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                fontSize: '14px'
              }
            : {})
        }}
      >
        {isDev ? (
          <p> AdSense Banner (dev mode)</p>
        ) : (
          <ins
            className='adsbygoogle'
            data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUB_ID}
            style={{ display: 'block', textAlign: 'center' }}
            {...data}
          />
        )}
      </div>
    </AdUnit>
  )
}

export { AdSenseBanner }
