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

const queueDataLayerEvent = (event: Record<string, unknown>) => {
  if (typeof window === 'undefined') return
  if (isHomeV2PreviewPath(window.location.pathname)) return

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(event)
  if (event.experiment_id === 'home_v2') {
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
  const event = {
    event: action || GA_EVENTS.EVENT.CLICK,
    non_interaction: false,
    ...props
  }
  queueDataLayerEvent(event)
  return event
}
