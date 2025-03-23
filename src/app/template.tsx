'use client'

import { FacebookProvider } from 'react-facebook'
import { GoogleTagManager } from '@next/third-parties/google'
import { TAG_MANAGER_ID } from '@lib/ads'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FacebookProvider appId={String(process.env.FACEBOOK_APP_ID)}>
        {children}
      </FacebookProvider>
      <GoogleTagManager gtmId={TAG_MANAGER_ID} />
    </>
  )
}
