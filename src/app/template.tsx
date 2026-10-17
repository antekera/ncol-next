'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { GAPageView } from '@lib/utils/ga'
import { GA_EVENTS } from '@lib/constants'
import { DeferredSiteScripts } from '@components/DeferredSiteScripts'
import { isBrowserAdDemoMode } from '@lib/adDemo'
import { isHomeV2PreviewPath } from '@lib/homeV2/preview'

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isAdDemo, setIsAdDemo] = useState(false)
  const isHomePreview = isHomeV2PreviewPath(pathname)

  useEffect(() => {
    setIsAdDemo(isBrowserAdDemoMode())
  }, [])

  useEffect(() => {
    if (isBrowserAdDemoMode()) return
    GAPageView({
      pageType: GA_EVENTS.VIEW.PAGE,
      pageUrl: pathname,
      pageTitle: document.title
    })
  }, [pathname])

  return (
    <>
      {children}
      {!isAdDemo && !isHomePreview ? <DeferredSiteScripts /> : null}
    </>
  )
}
