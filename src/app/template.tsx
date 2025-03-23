'use client'

import { useEffect } from 'react'
import { FacebookProvider } from 'react-facebook'
import { GoogleTagManager } from '@next/third-parties/google'
import Script from 'next/script'
import { TAG_MANAGER_ID } from '@lib/ads'

export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const scriptId = 'facebook-jssdk'
    if (!document.getElementById(scriptId)) {
      const fbRoot = document.createElement('div')
      fbRoot.id = 'fb-root'
      document.body.appendChild(fbRoot)
    }
  }, [])

  return (
    <>
      <Script
        async
        defer
        crossOrigin='anonymous'
        src={`https://connect.facebook.net/es_LA/sdk.js#xfbml=1&version=v22.0&appId=${process.env.FACEBOOK_APP_ID}`}
      />
      <FacebookProvider appId={String(process.env.FACEBOOK_APP_ID)}>
        {children}
      </FacebookProvider>
      <GoogleTagManager gtmId={TAG_MANAGER_ID} />
    </>
  )
}
