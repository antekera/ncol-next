'use client'

import { FacebookProvider } from 'react-facebook'
import { GoogleTagManager } from '@next/third-parties/google'
import Script from 'next/script'
import { TAG_MANAGER_ID } from '@lib/ads'
import { isProd } from '@lib/utils/env'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        async
        src='https://cse.google.com/cse.js?cx=partner-pub-6715059182926587'
        id='google_search'
        strategy='lazyOnload'
      />
      <FacebookProvider appId={String(process.env.FACEBOOK_APP_ID)}>
        {children}
      </FacebookProvider>
      {isProd && <GoogleTagManager gtmId={TAG_MANAGER_ID} />}
    </>
  )
}
