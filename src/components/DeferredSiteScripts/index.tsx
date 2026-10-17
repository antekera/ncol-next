'use client'

import dynamic from 'next/dynamic'
import { TAG_MANAGER_ID } from '@lib/ads'
import { isDev } from '@lib/utils'
import { DeferredGoogleTagManager } from '@components/DeferredGoogleTagManager'
import { DeferredRender } from '@components/DeferredRender'

const SocialBanners = dynamic(
  () => import('@components/SocialBanners').then(mod => mod.SocialBanners),
  { ssr: false }
)

export function DeferredSiteScripts({
  homeTiming = false
}: {
  homeTiming?: boolean
}) {
  return (
    <>
      <DeferredRender timeoutMs={4000}>
        <SocialBanners />
      </DeferredRender>
      {!isDev ? (
        <DeferredGoogleTagManager
          gtmId={TAG_MANAGER_ID}
          homeTiming={homeTiming}
        />
      ) : null}
    </>
  )
}
