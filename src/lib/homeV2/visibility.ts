/** visible_v1: 50% of the actual target, zero preload margin, one continuous second. */
export function observeVisible(
  element: Element,
  onVisible: () => void
): () => void {
  if (typeof IntersectionObserver === 'undefined') return () => {}
  let timer: ReturnType<typeof setTimeout> | undefined
  let complete = false
  const reset = () => {
    clearTimeout(timer)
    timer = undefined
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
          reset()
        } else if (!complete && timer === undefined) {
          timer = setTimeout(() => {
            timer = undefined
            if (document.visibilityState !== 'visible' || !element.isConnected)
              return
            complete = true
            observer.disconnect()
            document.removeEventListener('visibilitychange', visibilityChanged)
            onVisible()
          }, 1000)
        }
      }
    },
    { rootMargin: '0px', threshold: [0, 0.5] }
  )
  const visibilityChanged = () => {
    reset()
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
    reset()
    observer.disconnect()
    document.removeEventListener('visibilitychange', visibilityChanged)
  }
}
