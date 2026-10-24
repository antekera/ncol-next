import { GA_EVENTS } from '@lib/constants'
import { isHomeV2PreviewPath } from '@lib/homeV2/preview'
import {
  HOME_MEASUREMENT_KEYS,
  type HomeEventContext
} from '@lib/homeV2/measurementContext'

export interface PageEventProps extends HomeEventContext {
  pageType: string | null
  pageUrl: string
  pageTitle?: string
}

export interface EventProps extends HomeEventContext {
  action?: string
  category: string
  label: string
  value?: number
  nonInteraction?: boolean
  non_interaction?: boolean
}

let gesture: { context: HomeEventContext; consumed: boolean } | undefined

/** Keep context through native propagation; fill in only after legacy handlers. */
export function beginHomeGesture(
  context: HomeEventContext,
  fallback: () => void
) {
  const current = { context, consumed: false }
  gesture = current
  // A microtask may run between capture and React's delegated bubble handler.
  setTimeout(() => {
    if (gesture === current) gesture = undefined
    if (!current.consumed) fallback()
  }, 0)
}

const queueDataLayerEvent = (event: Record<string, unknown>) => {
  if (typeof window === 'undefined') return
  if (isHomeV2PreviewPath(window.location.pathname)) return

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(event)
  if (event.home_version === 'current' || event.home_version === 'v2') {
    window.dataLayer.push(
      Object.fromEntries(HOME_MEASUREMENT_KEYS.map(key => [key, null]))
    )
  }
}

export const GAPageView = (props: PageEventProps) => {
  const pageEvent = {
    event: GA_EVENTS.EVENT.VIEW,
    non_interaction: true,
    ...props
  }
  queueDataLayerEvent(pageEvent)
  return pageEvent
}

export const GAEvent = ({ action, ...props }: EventProps) => {
  const articleClick =
    ((!action || action === GA_EVENTS.EVENT.CLICK) &&
      [
        GA_EVENTS.POST_LINK.SINGLE.CATEGORY,
        GA_EVENTS.POST_LINK.COVER.CATEGORY
      ].includes(props.category)) ||
    (props.category === GA_EVENTS.VIDEO_WIDGET.CATEGORY &&
      [
        GA_EVENTS.VIDEO_WIDGET.CLICK_POST_LINK,
        GA_EVENTS.VIDEO_WIDGET.CLICK_VIEW_NEWS
      ].includes(action ?? ''))
  const active = !props.home_version && articleClick ? gesture : undefined
  const event = {
    event: action || GA_EVENTS.EVENT.CLICK,
    non_interaction: false,
    ...props,
    ...active?.context
  }
  if (active?.consumed) return event
  if (active) active.consumed = true
  queueDataLayerEvent(event)
  return event
}
