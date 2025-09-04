import { GA_EVENTS } from '@lib/constants'

export interface PageEventProps {
  pageType: string | null
  pageUrl: string
  pageTitle?: string
}

export interface EventProps {
  action?: string
  category: string
  label: string
  value?: number
  nonInteraction?: boolean
}

export const GAPageView = (props: PageEventProps) => {
  const pageEvent = {
    event: GA_EVENTS.EVENT.VIEW,
    non_interaction: true,
    ...props
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  window && window.dataLayer && window.dataLayer.push(pageEvent)
  return pageEvent
}

export const GAEvent = ({ action, ...props }: EventProps) => {
  const event = {
    event: action || GA_EVENTS.EVENT.CLICK,
    non_interaction: false,
    ...props
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  window && window.dataLayer && window.dataLayer.push(event)
  return event
}
