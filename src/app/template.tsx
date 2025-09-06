'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { FacebookProvider } from 'react-facebook'
import { GoogleTagManager } from '@next/third-parties/google'
import Script from 'next/script'
import { TAG_MANAGER_ID } from '@lib/ads'
import { GAPageView } from '@lib/utils/ga'
import { GA_EVENTS } from '@lib/constants'
import { isDev } from '@lib/utils'
import { FacebookDialog } from '@components/FacebookDialog'
import { WhatsappDialog } from '@components/WhatsappDialog'

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    const scriptId = 'facebook-jssdk'
    if (!document.getElementById(scriptId)) {
      const fbRoot = document.createElement('div')
      fbRoot.id = 'fb-root'
      document.body.appendChild(fbRoot)
    }
  }, [])

  useEffect(() => {
    GAPageView({
      pageType: GA_EVENTS.VIEW.PAGE,
      pageUrl: pathname,
      pageTitle: document.title
    })
  }, [pathname])

  return (
    <>
      <Script
        async
        defer
        crossOrigin='anonymous'
        src={`https://connect.facebook.net/es_LA/sdk.js#xfbml=1&version=v22.0&appId=${process.env.FACEBOOK_APP_ID}`}
      />
      <FacebookProvider appId={String(process.env.FACEBOOK_APP_ID)}>
        <>
          {children}
          {process.env.NEXT_PUBLIC_FACEBOOK_DIALOG_ENABLED === 'true' ? (
            <FacebookDialog />
          ) : null}
          {process.env.NEXT_PUBLIC_WHATSAPP_DIALOG_ENABLED === 'true' &&
          !isDev ? (
            <WhatsappDialog />
          ) : null}
          <WhatsappDialog />
        </>
      </FacebookProvider>
      {!isDev ? <GoogleTagManager gtmId={TAG_MANAGER_ID} /> : null}
    </>
  )
}
