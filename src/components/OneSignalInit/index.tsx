'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { bindOneSignalUser } from '@lib/oneSignalWeb'
import { createClient } from '@lib/supabase/client'

// Loads the OneSignal Web SDK once and binds the current Supabase session
// (if any) as its external_id, so /api/webhooks/wp-publish can target this
// reader via include_aliases. Renders nothing when the app id isn't
// configured yet.
export function OneSignalInit() {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID

  useEffect(() => {
    if (!appId) return
    let cancelled = false
    const supabase = createClient()
    void supabase.auth.getUser().then(({ data }) => {
      if (!cancelled && data.user) bindOneSignalUser(data.user.id)
    })
    return () => {
      cancelled = true
    }
  }, [appId])

  if (!appId) return null

  return (
    <>
      <Script
        id='onesignal-deferred-init'
        strategy='afterInteractive'
        dangerouslySetInnerHTML={{
          __html: `
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(function(OneSignal) {
              OneSignal.init({ appId: ${JSON.stringify(appId)} });
            });
          `
        }}
      />
      <Script
        id='onesignal-sdk'
        src='https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
        strategy='afterInteractive'
      />
    </>
  )
}
