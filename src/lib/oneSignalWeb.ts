// Thin wrapper around OneSignal's Web SDK "deferred" queue. Pushing a
// callback onto window.OneSignalDeferred works whether the SDK script
// (loaded in layout.tsx) has finished loading yet or not, so callers don't
// have to coordinate with script load timing.
type OneSignalSdk = {
  login: (externalId: string) => Promise<void>
  logout: () => Promise<void>
  Notifications: { requestPermission: () => Promise<void> }
}

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: OneSignalSdk) => void | Promise<void>>
  }
}

function withOneSignal(
  callback: (OneSignal: OneSignalSdk) => void | Promise<void>
) {
  if (typeof window === 'undefined') return
  if (!process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) return
  window.OneSignalDeferred = window.OneSignalDeferred || []
  window.OneSignalDeferred.push(callback)
}

let retryTimeoutId: ReturnType<typeof setTimeout> | null = null

function cancelPendingRetry() {
  if (retryTimeoutId !== null) {
    clearTimeout(retryTimeoutId)
    retryTimeoutId = null
  }
}

function retryLogin(externalId: string) {
  retryTimeoutId = null
  withOneSignal(os => os.login(externalId).catch(() => {}))
}

// Binds this browser to the logged-in Supabase user id as OneSignal's
// external_id — this is what /api/webhooks/wp-publish targets via
// include_aliases when a subscribed tag's post is published.
// OneSignal's deferred queue fires before its internal state is fully ready,
// so login() can throw on the first attempt. We retry once after a short
// delay; if that also fails we give up silently — push binding is best-effort.
export function bindOneSignalUser(externalId: string) {
  cancelPendingRetry()
  withOneSignal(async OneSignal => {
    try {
      await OneSignal.login(externalId)
    } catch {
      retryTimeoutId = setTimeout(retryLogin, 3000, externalId)
    }
  })
}

// Clears the external_id association on logout — without this, a shared
// device (or the same browser signing in as a different account) would
// keep receiving push notifications targeted at the previous account.
export function unbindOneSignalUser() {
  cancelPendingRetry()
  withOneSignal(OneSignal => OneSignal.logout())
}

// Prompts for push permission. Only call this from a genuine subscribe
// action (not on page load for every visitor) — browsers penalize sites
// that ask upfront, and a denied prompt can't be re-asked.
export function requestOneSignalPermission() {
  withOneSignal(OneSignal => OneSignal.Notifications.requestPermission())
}
