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
  const classes = cn(
    'adsbygoogle adbanner-customize border-primary border-slate-200 bg-slate-100 dark:border-neutral-500 dark:bg-neutral-800',
    className
  )
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
                fontSize: '14px'
              }
            : {})
        }}
      >
        {isDev ? (
          <p className='font-sans'> AdSense Banner (dev mode)</p>
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
