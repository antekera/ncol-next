import { EventProps, GAEvent, GAPageView, PageEventProps } from '../ga'

const label = 'test label'

describe('GAPageView', () => {
  beforeEach(() => {
    window.dataLayer = []
  })

  it('should create a page view event with the correct properties', () => {
    const props: PageEventProps = {
      pageType: 'test',
      pageUrl: 'http://test.com',
      pageTitle: 'Test Page'
    }
    const event = GAPageView(props)
    expect(event).toEqual({
      event: 'CUSTOM_PAGE_VIEW',
      non_interaction: true,
      pageType: 'test',
      pageUrl: 'http://test.com',
      pageTitle: 'Test Page'
    })
  })

  it('should queue page views when GTM has not initialized dataLayer yet', () => {
    delete (window as Partial<Window>).dataLayer

    const props: PageEventProps = {
      pageType: 'test',
      pageUrl: 'http://test.com',
      pageTitle: 'Test Page'
    }

    const event = GAPageView(props)

    expect(window.dataLayer).toEqual([event])
  })
})

describe('GAEvent', () => {
  beforeEach(() => {
    window.dataLayer = []
  })

  it('should create a click event with the correct properties', () => {
    const props: EventProps = {
      category: 'test',
      label,
      value: 123,
      nonInteraction: true
    }
    const event = GAEvent(props)
    expect(event).toEqual({
      event: 'CLICK_EVENT',
      non_interaction: false,
      category: 'test',
      label,
      value: 123,
      nonInteraction: true
    })
  })

  it('should create a custom event with the correct properties', () => {
    const props: EventProps = {
      action: 'CUSTOM_EVENT',
      category: 'test',
      label,
      value: 123,
      nonInteraction: true
    }
    const event = GAEvent(props)
    expect(event).toEqual({
      event: 'CUSTOM_EVENT',
      non_interaction: false,
      category: 'test',
      label,
      value: 123,
      nonInteraction: true
    })
  })
})
