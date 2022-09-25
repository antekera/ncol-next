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
    event: 'CUSTOM_PAGE_VIEW',
    ...props
  }
  //@ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  window && window.dataLayer && window.dataLayer.push(pageEvent)
  return pageEvent
}

export const GAEvent = ({ action, ...props }: EventProps) => {
  const event = {
    event: action || 'CLICK_EVENT',
    non_interaction: false,
    ...props
  }
  //@ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  window && window.dataLayer && window.dataLayer.push(event)
  return event
}
