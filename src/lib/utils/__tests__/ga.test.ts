import {
  EventProps,
  GAEvent,
  GAPageView,
  PageEventProps,
  beginHomeGesture
} from '../ga'

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

describe('local Home V2 preview', () => {
  it('keeps QA clicks and views out of the existing dataLayer', () => {
    const original = window.location.pathname
    window.history.replaceState({}, '', '/home-v2-preview/')
    window.dataLayer = []
    try {
      GAPageView({ pageType: 'PAGE', pageUrl: '/home-v2-preview/' })
      GAEvent({ category: 'COVER', label: 'LINK_COVER' })
      expect(window.dataLayer).toEqual([])
    } finally {
      window.history.replaceState({}, '', original)
    }
  })
})

describe('Home experiment context through the existing transport', () => {
  beforeEach(() => {
    window.dataLayer = []
  })

  it('honors canonical non_interaction without changing the legacy camelCase contract', () => {
    const event = GAEvent({
      action: 'MODULE_IMPRESSION',
      category: 'HOME_MODULE',
      label: 'zulia',
      non_interaction: true,
      experiment_id: 'home_v2',
      home_variant: 'v2',
      module_id: 'zulia',
      editorial_position: 2,
      home_view_id: 'view-1'
    })
    expect(event.non_interaction).toBe(true)
    expect(window.dataLayer?.[0]).toEqual(event)
  })

  it('clears experimental fields after the event so subsequent legacy tags cannot inherit them', () => {
    GAPageView({
      pageType: 'PAGE',
      pageUrl: '/',
      experiment_id: 'home_v2',
      home_variant: 'control',
      home_view_id: 'view-1'
    })
    GAEvent({ category: 'MENU', label: 'OPEN_MENU' })
    expect(window.dataLayer).toHaveLength(3)
    expect(window.dataLayer?.[1]).toMatchObject({
      experiment_id: null,
      home_variant: null,
      module_id: null,
      article_id: null,
      origin_article_id: null,
      home_view_id: null
    })
    expect(window.dataLayer?.[1]).not.toHaveProperty('event')
    expect(window.dataLayer?.[2]).toEqual({
      event: 'CLICK_EVENT',
      non_interaction: false,
      category: 'MENU',
      label: 'OPEN_MENU'
    })
  })
  it('lets the native event reach a later delegated handler across a microtask checkpoint', async () => {
    jest.useRealTimers()
    const context = {
      experiment_id: 'home_v2',
      home_variant: 'control',
      module_id: 'ranking-week',
      article_id: 'post-1'
    } as const
    beginHomeGesture(context, () =>
      GAEvent({ ...context, category: 'LINK_SINGLE', label: 'GO_TO_POST' })
    )
    await Promise.resolve()
    GAEvent({ category: 'LINK_SINGLE', label: 'RECENT_NEWS' })
    await new Promise(resolve => setTimeout(resolve, 0))
    const clicks = (window.dataLayer ?? []).filter(value => 'event' in value)
    expect(clicks).toHaveLength(1)
    expect(clicks[0]).toMatchObject({ ...context, label: 'RECENT_NEWS' })
    GAEvent({ category: 'LINK_SINGLE', label: 'UNRELATED' })
    expect(window.dataLayer?.at(-1)).not.toHaveProperty('experiment_id')
  })
})
