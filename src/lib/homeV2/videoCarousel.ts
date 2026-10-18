import {
  isHomeMediaMeasured,
  reportCarouselNavigation,
  type NavigationMethod
} from './mediaBridge'

function leadingPosition(strip: HTMLElement) {
  const bounds = strip.getBoundingClientRect()
  if (!bounds.width) return undefined
  for (const card of strip.querySelectorAll<HTMLElement>(
    '[data-item-position]'
  )) {
    const rect = card.getBoundingClientRect()
    const overlap =
      Math.min(rect.right, bounds.right) - Math.max(rect.left, bounds.left)
    if (rect.width > 0 && overlap >= Math.min(rect.width, bounds.width) / 2)
      return Number(card.dataset.itemPosition)
  }
}

/** Native scrolling; geometry is read at boundaries, never on each scroll tick. */
export function mountVideoCarousel(strip: HTMLElement) {
  let settledPosition =
    Number(
      strip.querySelector<HTMLElement>('[data-item-position]')?.dataset
        .itemPosition
    ) || undefined
  let settledLeft = strip.scrollLeft
  let gesture:
    { from: number; method: NavigationMethod; scrolled: boolean } | undefined
  let settleTimer: ReturnType<typeof setTimeout> | undefined
  let expiryTimer: ReturnType<typeof setTimeout> | undefined
  let pointerHeld = false
  let touchHeld = false
  let keyHeld = false
  const nativeEnd = typeof strip.onscrollend !== 'undefined'
  const abort = () => {
    clearTimeout(settleTimer)
    clearTimeout(expiryTimer)
    gesture = undefined
    pointerHeld = false
    touchHeld = false
    keyHeld = false
  }
  const end = () => {
    if (pointerHeld || touchHeld || keyHeld) return
    const current = gesture
    abort()
    if (!isHomeMediaMeasured(strip) || document.visibilityState !== 'visible')
      return
    const to = leadingPosition(strip)
    if (to) settledPosition = to
    settledLeft = strip.scrollLeft
    if (current?.scrolled && to && to !== current.from)
      reportCarouselNavigation(strip, current.from, to, current.method)
  }
  const settle = () => {
    if (nativeEnd) return
    clearTimeout(settleTimer)
    settleTimer = setTimeout(end, 250)
  }
  const arm = (method: NavigationMethod) => {
    if (!isHomeMediaMeasured(strip)) return
    // A passive wheel handler can run after compositor scrolling has begun.
    // Preserve the preceding settled position instead of sampling its new one.
    const from =
      gesture?.from ??
      (method === 'gesture' ? settledPosition : leadingPosition(strip))
    if (!from) return
    gesture ??= {
      from,
      method,
      scrolled:
        method === 'gesture' && Math.abs(strip.scrollLeft - settledLeft) > 1
    }
    clearTimeout(expiryTimer)
    // An edge click without translation cannot own a later resize scroll.
    expiryTimer = setTimeout(() => {
      if (!gesture?.scrolled && !pointerHeld && !touchHeld && !keyHeld) abort()
    }, 800)
  }
  const scroll = () => {
    if (gesture) gesture.scrolled = true
    if (gesture || (!nativeEnd && isHomeMediaMeasured(strip))) settle()
  }
  const pointerDown = () => {
    pointerHeld = true
    arm('gesture')
  }
  const pointerUp = () => {
    pointerHeld = false
    if (gesture?.scrolled) settle()
    else abort()
  }
  const pointerCancel = () => {
    // Native touch panning takes over the pointer before its first scroll.
    // Keep the armed gesture; no movement still expires through arm's timer.
    pointerHeld = false
    if (gesture?.scrolled) settle()
  }
  const touchStart = () => {
    touchHeld = true
    arm('gesture')
  }
  const touchEnd = (event: Event) => {
    touchHeld = event instanceof TouchEvent && event.touches.length > 0
    if (touchHeld) return
    if (gesture?.scrolled) settle()
    else abort()
  }
  const wheel = (event: Event) => {
    if (event instanceof WheelEvent && (event.deltaX !== 0 || event.shiftKey))
      arm('gesture')
  }
  const keyDown = (event: Event) => {
    if (
      event instanceof KeyboardEvent &&
      ['ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(
        event.key
      )
    ) {
      keyHeld = true
      arm('gesture')
    }
  }
  const keyUp = () => {
    keyHeld = false
    if (gesture?.scrolled) settle()
    else abort()
  }
  const hidden = () => {
    if (document.visibilityState !== 'visible') abort()
  }
  const resize = () => {
    abort()
    if (isHomeMediaMeasured(strip)) settledPosition = leadingPosition(strip)
    settledLeft = strip.scrollLeft
  }
  const bindings: Array<[EventTarget, string, EventListener]> = [
    [strip, 'scroll', scroll],
    [strip, 'scrollend', end],
    [strip, 'pointerdown', pointerDown],
    [window, 'pointerup', pointerUp],
    [window, 'pointercancel', pointerCancel],
    [strip, 'touchstart', touchStart],
    [window, 'touchend', touchEnd],
    [window, 'touchcancel', touchEnd],
    [strip, 'wheel', wheel],
    [strip, 'keydown', keyDown],
    [window, 'keyup', keyUp],
    [window, 'blur', abort],
    [window, 'resize', resize],
    [document, 'visibilitychange', hidden]
  ]
  for (const [target, name, handler] of bindings)
    target.addEventListener(name, handler, { passive: true })
  return {
    move(direction: 'previous' | 'next') {
      const maximum = strip.scrollWidth - strip.clientWidth
      if (
        (direction === 'previous' && strip.scrollLeft <= 1) ||
        (direction === 'next' && strip.scrollLeft >= maximum - 1)
      )
        return
      arm('arrow')
      strip.scrollBy({
        left: strip.clientWidth * (direction === 'next' ? 1 : -1),
        behavior: 'smooth'
      })
    },
    stop() {
      abort()
      for (const [target, name, handler] of bindings)
        target.removeEventListener(name, handler)
    }
  }
}
