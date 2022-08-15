export interface PageEventProps {
  pageType: string | null
  pageUrl: string
  pageTitle?: string
}

export const GTMPageView = (props: PageEventProps) => {
  const pageEvent = {
    event: 'page_view_custom',
    ...props
  }
  //@ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  window && window.dataLayer && window.dataLayer.push(pageEvent)
  return pageEvent
}
