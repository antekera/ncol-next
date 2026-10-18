'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createPageMeasurement } from '@lib/homeV2/pageMeasurement'
import { DeferredSiteScripts } from '@components/DeferredSiteScripts'
import { isBrowserAdDemoMode } from '@lib/adDemo'
import { isHomeV2PreviewPath } from '@lib/homeV2/preview'

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isAdDemo, setIsAdDemo] = useState(false)
  const isHomePreview = isHomeV2PreviewPath(pathname)
  const owner = useRef<{
    pathname: string
    measurement: ReturnType<typeof createPageMeasurement>
  } | null>(null)

  useEffect(() => {
    setIsAdDemo(isBrowserAdDemoMode())
  }, [])

  useEffect(() => {
    if (
      document.body.dataset.homeReadingQa !== 'granted' ||
      isBrowserAdDemoMode()
    )
      return
    let stopped = false
    let dispose: (() => void) | undefined
    void import('@lib/homeV2/browserReading').then(
      ({ mountBrowserReading }) => {
        if (!stopped) dispose = mountBrowserReading()
      }
    )
    return () => {
      stopped = true
      dispose?.()
    }
  }, [pathname])

  useEffect(() => {
    if (isBrowserAdDemoMode()) return
    if (owner.current?.pathname !== pathname)
      owner.current = { pathname, measurement: createPageMeasurement(pathname) }
    return owner.current.measurement.mount()
  }, [pathname])

  return (
    <>
      {children}
      {!isAdDemo && !isHomePreview ? <DeferredSiteScripts /> : null}
    </>
  )
}
