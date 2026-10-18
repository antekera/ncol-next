import { mountReadingDom } from './readingDom'
import {
  getBrowserReadingRuntime,
  mountBrowserReadingOrigins,
  readingQaAllowed
} from './browserReadingOrigin'

export { readingQaAllowed } from './browserReadingOrigin'

/** Destination observation stays deferred; the synchronous click owner is separate. */
export function mountBrowserReadingDestination() {
  const current = getBrowserReadingRuntime()
  let stop = () => {}
  let active = false
  const reconcile = () => {
    const allowed = readingQaAllowed()
    current.setAllowed(allowed)
    if (active === allowed) return
    stop()
    active = allowed
    if (allowed) stop = mountReadingDom(current)
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

/** Compatibility mount for consumers owning both lifecycles. */
export function mountBrowserReading() {
  const stopOrigins = mountBrowserReadingOrigins()
  const stopDestination = mountBrowserReadingDestination()
  return () => {
    stopDestination()
    stopOrigins()
  }
}
