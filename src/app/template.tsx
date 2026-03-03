'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { GoogleTagManager } from '@next/third-parties/google'
import { TAG_MANAGER_ID } from '@lib/ads'
import { GAPageView } from '@lib/utils/ga'
import { GA_EVENTS } from '@lib/constants'
import { isDev } from '@lib/utils'
import { SocialBanners } from '@components/SocialBanners'

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
      <SocialBanners />
      {!isDev ? <GoogleTagManager gtmId={TAG_MANAGER_ID} /> : null}
    </>
  )
}
