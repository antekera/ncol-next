'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { TAG_MANAGER_ID } from '@lib/ads'
import { GAPageView } from '@lib/utils/ga'
import { GA_EVENTS } from '@lib/constants'
import { isDev } from '@lib/utils'
import { DeferredGoogleTagManager } from '@components/DeferredGoogleTagManager'
import { DeferredRender } from '@components/DeferredRender'

const SocialBanners = dynamic(
  () => import('@components/SocialBanners').then(mod => mod.SocialBanners),
  { ssr: false }
)

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    GAPageView({
      pageType: GA_EVENTS.VIEW.PAGE,
      pageUrl: pathname,
      pageTitle: document.title
    })
  }, [pathname])

  return (
    <>
      {children}
      <DeferredRender timeoutMs={4000}>
        <SocialBanners />
      </DeferredRender>
      {!isDev ? <DeferredGoogleTagManager gtmId={TAG_MANAGER_ID} /> : null}
    </>
  )
}
