'use client'

import { useEffect, useState } from 'react'

import { usePathname } from 'next/navigation'
import Script from 'next/script'

import { dfp } from '@lib/next-google-dfp-main/src/apis/dfp'
import { AdsContext } from '@lib/next-google-dfp-main/src/contexts/ads'
import { AdsProviderComponent } from '@lib/next-google-dfp-main/src/types'

export const AdsProvider: AdsProviderComponent = ({
  ads,
  children,
  debug = false,
  enableLazyload = true,
  enableRefresh = true
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  // Create ad slots
  useEffect(() => {
    setIsLoading(true)

    dfp.createSlots(ads, enableLazyload, enableRefresh)

    setIsLoading(false)

    const handleRouteChangeStart = (url: any) => {
      if (window.location.pathname !== url) {
        setIsLoading(true)
        dfp.removeSlots()
        dfp.createSlots(ads, enableLazyload, enableRefresh)
      }
    }

    const handleRouteChangeComplete = () => {
      setIsLoading(false)
    }

    handleRouteChangeComplete()

    return () => {
      handleRouteChangeStart(pathname)
    }
  }, [ads, enableLazyload, enableRefresh, pathname])

  useEffect(() => {}, [pathname])

  // Enable debug console if possible
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)

    if (!!debug && !searchParams.has('google_console')) {
      searchParams.append('google_console', '1')
      window.location = `${window.location.pathname}?${searchParams}` as any
    }

    if (!debug && searchParams.has('google_console')) {
      searchParams.delete('google_console')

      const search = `${searchParams}`.length > 0 ? `?${searchParams}` : ''
      window.location = `${window.location.pathname}${search}` as any
    }
  }, [debug])

  return (
    <>
      <AdsContext.Provider value={{ isLoading }}>
        {children}
      </AdsContext.Provider>
      {process.env.NODE_ENV === 'production' && (
        <Script
          src='https://securepubads.g.doubleclick.net/tag/js/gpt.js'
          async
        />
      )}
    </>
  )
}
