// Thin wrapper around OneSignal's Web SDK "deferred" queue. Pushing a
// callback onto window.OneSignalDeferred works whether the SDK script
// (loaded in layout.tsx) has finished loading yet or not, so callers don't
// have to coordinate with script load timing.
type OneSignalSdk = {
  login: (externalId: string) => Promise<void>
  Notifications: { requestPermission: () => Promise<void> }
}

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: OneSignalSdk) => void | Promise<void>>
  }
}

function withOneSignal(callback: (OneSignal: OneSignalSdk) => void | Promise<void>) {
  if (typeof window === 'undefined') return
  if (!process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) return
  window.OneSignalDeferred = window.OneSignalDeferred || []
  window.OneSignalDeferred.push(callback)
}

// Binds this browser to the logged-in Supabase user id as OneSignal's
// external_id — this is what /api/webhooks/wp-publish targets via
// include_aliases when a subscribed tag's post is published.
export function bindOneSignalUser(externalId: string) {
  withOneSignal(OneSignal => OneSignal.login(externalId))
}

// Prompts for push permission. Only call this from a genuine subscribe
// action (not on page load for every visitor) — browsers penalize sites
// that ask upfront, and a denied prompt can't be re-asked.
export function requestOneSignalPermission() {
  withOneSignal(OneSignal => OneSignal.Notifications.requestPermission())
}
