import { connectReadingClicks } from './readingBridge'
import { mountReadingDom } from './readingDom'
import { createReadingRuntime } from './readingRuntime'

let runtime: ReturnType<typeof createReadingRuntime> | undefined
export function readingQaAllowed() {
  return (
    ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname) &&
    document.body.dataset.homeMeasurementQa === 'true' &&
    document.body.dataset.homeReadingQa === 'granted'
  )
}

/** Explicit local fixture only. No production consent policy is inferred here. */
export function mountBrowserReading() {
  if (!runtime) {
    let storage: Storage | undefined
    try {
      storage = window.localStorage
    } catch {
      /* Optional storage. */
    }
    runtime = createReadingRuntime({
      allowed: readingQaAllowed(),
      storage,
      exclusive: navigator.locks
        ? action => navigator.locks.request('ncol:home-v2-reading', action)
        : undefined
    })
  }
  const current = runtime
  let stop = () => {}
  let active = false
  const reconcile = () => {
    const allowed = readingQaAllowed()
    current.setAllowed(allowed)
    if (active === allowed) return
    stop()
    active = allowed
    if (!allowed) return
    const disconnect = connectReadingClicks((destination, origin) => {
      const url = new URL(destination, window.location.href)
      if (
        url.origin === window.location.origin ||
        ['www.noticiascol.com', 'noticiascol.com'].includes(url.hostname)
      )
        current.remember(
          url.origin === window.location.origin ? url.pathname : url.href,
          origin
        )
    })
    const stopDom = mountReadingDom(current)
    stop = () => {
      disconnect()
      stopDom()
    }
  }
  const permissions = new MutationObserver(reconcile)
  permissions.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-home-reading-qa', 'data-home-measurement-qa']
  })
  reconcile()
  return () => {
    permissions.disconnect()
    stop()
  }
}
