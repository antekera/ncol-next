'use client'

import { GoogleTagManager } from '@next/third-parties/google'
import { FacebookProvider } from 'react-facebook'

import { DFP_ADS, TAG_MANAGER_ID } from '@lib/ads'
import { AdsProvider } from '@lib/next-google-dfp-main/src'
import { isProd } from '@lib/utils/env'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <AdsProvider ads={DFP_ADS}>
      <FacebookProvider appId={String(process.env.FACEBOOK_APP_ID)}>
        {children}
      </FacebookProvider>
      {isProd() && <GoogleTagManager gtmId={TAG_MANAGER_ID} />}
    </AdsProvider>
  )
}
