'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { TAG_MANAGER_ID } from '@lib/ads'
import { GAPageView } from '@lib/utils/ga'
import { GA_EVENTS } from '@lib/constants'
import { isDev } from '@lib/utils'
import { DeferredGoogleTagManager } from '@components/DeferredGoogleTagManager'
import { DeferredRender } from '@components/DeferredRender'
import { isBrowserAdDemoMode } from '@lib/adDemo'

const SocialBanners = dynamic(
  () => import('@components/SocialBanners').then(mod => mod.SocialBanners),
  { ssr: false }
)

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isAdDemo, setIsAdDemo] = useState(false)

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
      {!isAdDemo ? (
        <>
          <DeferredRender timeoutMs={4000}>
            <SocialBanners />
          </DeferredRender>
          {!isDev ? <DeferredGoogleTagManager gtmId={TAG_MANAGER_ID} /> : null}
        </>
      ) : null}
    </>
  )
}
