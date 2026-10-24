import { isUncovered, readOccluders, type Box } from './occlusion'
import { watchVisibility } from './visibilityChecks'

/** visible_v1: 50% after own overlays/clipping, zero margin, one continuous second. */
export function observeVisible(
  element: Element,
  onVisible: () => void
): () => void {
  if (typeof IntersectionObserver === 'undefined') return () => {}
  let timer: ReturnType<typeof setTimeout> | undefined
  let complete = false
  let unwatch: (() => void) | undefined
  const reset = () => {
    clearTimeout(timer)
    timer = undefined
  }
  const leave = () => {
    unwatch?.()
    unwatch = undefined
    reset()
  }
  const check = (blockers: Box[], restart: boolean) => {
    if (complete) return
    if (restart) reset()
    if (
      document.visibilityState !== 'visible' ||
      !isUncovered(element, blockers)
    ) {
      reset()
      return
    }
    if (timer !== undefined) return
    timer = setTimeout(() => {
      timer = undefined
      if (
        document.visibilityState !== 'visible' ||
        !isUncovered(element, readOccluders())
      )
        return
      complete = true
      leave()
      observer.disconnect()
      document.removeEventListener('visibilitychange', visibilityChanged)
      onVisible()
    }, 1000)
  }
  const observer = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (entry.target !== element) continue
        if (
          !entry.isIntersecting ||
          entry.intersectionRatio < 0.5 ||
          document.visibilityState !== 'visible'
        ) {
          leave()
        } else if (!complete && !unwatch) {
          unwatch = watchVisibility({ element, check })
        }
      }
    },
    { rootMargin: '0px', threshold: [0, 0.5] }
  )
  const visibilityChanged = () => {
    leave()
    // A stale ratio from before backgrounding is insufficient. Re-observe to
    // request a fresh geometry sample when this document becomes visible again.
    observer.disconnect()
    if (!complete && document.visibilityState === 'visible')
      observer.observe(element)
  }
  document.addEventListener('visibilitychange', visibilityChanged)
  observer.observe(element)
  return () => {
    complete = true
    leave()
    observer.disconnect()
    document.removeEventListener('visibilitychange', visibilityChanged)
  }
}
