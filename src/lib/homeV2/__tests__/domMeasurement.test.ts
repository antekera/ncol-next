import { createHomeMeasurement } from '../measurement'
import { mountHomeMeasurement as mount } from '../domMeasurement'

const context = {
  experiment_id: 'home_v2',
  home_variant: 'v2',
  home_view_id: 'view-1',
  opening_treatment: 'photographic'
} as const
describe('Home DOM measurement', () => {
  const stops: Array<() => void> = []
  const mountHomeMeasurement = (...args: Parameters<typeof mount>) => {
    const stop = mount(...args)
    stops.push(stop)
    return stop
  }
  const samples = new Map<Element, IntersectionObserverCallback>()
  beforeEach(() => {
    jest.useFakeTimers()
    window.dataLayer = []
    window.history.replaceState({}, '', '/')
    samples.clear()
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible'
    })
    window.IntersectionObserver = jest
      .fn()
      .mockImplementation((callback: IntersectionObserverCallback) => ({
        observe: (element: Element) => samples.set(element, callback),
        disconnect: jest.fn()
      }))
    document.body.innerHTML = `<div id="home"><section data-module-id="zulia" data-editorial-position="2" data-region-id="zulia"><h2 data-module-marker>Zulia</h2><article data-article-id="post-1" data-item-position="1" data-component-type="lead_card"><a href="/2026/10/17/public-news/">Noticia</a></article><a href="/categoria/zulia/" data-component-type="section_link">Más</a></section></div>`
    for (const target of document.querySelectorAll('h2, article'))
      jest
        .spyOn(target, 'getBoundingClientRect')
        .mockReturnValue(new DOMRect(0, 100, 200, 100))
  })
  afterEach(() => {
    for (const stop of stops.splice(0)) stop()
    jest.restoreAllMocks()
    jest.useRealTimers()
    document.body.innerHTML = ''
  })
  const root = () => document.querySelector<HTMLElement>('#home')!
  const events = () =>
    (window.dataLayer ?? []).filter(
      (event): event is Record<string, unknown> => 'event' in event
    )
  const expose = (element: Element) =>
    samples.get(element)?.(
      [
        {
          target: element,
          isIntersecting: true,
          intersectionRatio: 1
        } as IntersectionObserverEntry
      ],
      {} as IntersectionObserver
    )
  it('observes actual cards and an editorial start marker, not preload margins or an entire tall module', () => {
    const stop = mountHomeMeasurement(
      root(),
      createHomeMeasurement(context, new Set())
    )
    expose(document.querySelector('h2')!)
    jest.advanceTimersByTime(1000)
    expect(events()).toHaveLength(1)
    expect(events()[0]).toMatchObject({
      event: 'MODULE_IMPRESSION',
      module_id: 'zulia'
    })
    expose(document.querySelector('article')!)
    jest.advanceTimersByTime(1000)
    expect(events()[1]).toMatchObject({
      event: 'CARD_IMPRESSION',
      article_id: 'post-1',
      region_id: 'zulia'
    })
    stop()
  })
  it('attributes each link gesture once, includes the module and handles modified/new-tab intent', () => {
    const stop = mountHomeMeasurement(
      root(),
      createHomeMeasurement(context, new Set())
    )
    document.querySelector('article a')!.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        ctrlKey: true,
        cancelable: true
      })
    )
    document.querySelector('article a')!.dispatchEvent(
      new MouseEvent('auxclick', {
        bubbles: true,
        button: 1,
        cancelable: true
      })
    )
    document
      .querySelector('[data-component-type="section_link"]')!
      .dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true })
      )
    expect(events()).toHaveLength(3)
    expect(events()[0]).toMatchObject({
      module_id: 'zulia',
      article_id: 'post-1',
      item_position: 1
    })
    expect(events()[2]).toMatchObject({
      category: 'HOME_SECTION',
      label: 'VIEW_MORE',
      module_id: 'zulia'
    })
    stop()
  })
  it('restarts visibility when a filtered card is replaced and cancels all work on unmount', async () => {
    const stop = mountHomeMeasurement(
      root(),
      createHomeMeasurement(context, new Set())
    )
    const card = document.querySelector('article')!
    expose(card)
    jest.advanceTimersByTime(999)
    card.dataset.articleId = 'post-2'
    await Promise.resolve()
    jest.advanceTimersByTime(1)
    expect(events()).toEqual([])
    expose(card)
    jest.advanceTimersByTime(1000)
    expect(events()[0]).toMatchObject({ article_id: 'post-2' })
    stop()
    card.dataset.articleId = 'post-3'
    expose(card)
    jest.advanceTimersByTime(1000)
    expect(events()).toHaveLength(1)
  })
  it('does not measure a loading placeholder as a module impression', () => {
    document.querySelector('article')!.remove()
    document.querySelector('[data-component-type="section_link"]')!.remove()
    const stop = mountHomeMeasurement(
      root(),
      createHomeMeasurement(context, new Set())
    )
    expect(samples.size).toBe(0)
    stop()
  })

  it('treats the opening headline as a module marker without inventing a visible card', () => {
    root().innerHTML =
      '<section data-module-id="opening" data-editorial-position="1"><article data-article-id="lead" data-item-position="1" data-component-type="hero"><h1>Titular visible</h1></article></section>'
    const headline = root().querySelector('h1')!
    const card = root().querySelector('article')!
    jest
      .spyOn(headline, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(0, 0, 200, 30))
    const bounds = jest
      .spyOn(card, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(0, -200, 200, 300))
    const stop = mountHomeMeasurement(
      root(),
      createHomeMeasurement(context, new Set())
    )
    expose(headline)
    jest.advanceTimersByTime(1000)
    expect(events()).toHaveLength(1)
    expect(events()[0]).toMatchObject({
      event: 'MODULE_IMPRESSION',
      module_id: 'opening'
    })
    expect(events()[0]).not.toHaveProperty('article_id', 'lead')
    bounds.mockReturnValue(new DOMRect(0, 100, 200, 300))
    expose(card)
    jest.advanceTimersByTime(1000)
    expect(events()[1]).toMatchObject({
      event: 'CARD_IMPRESSION',
      article_id: 'lead'
    })
    stop()
  })

  it('recognizes real content when the control opening is itself the article target', () => {
    root().innerHTML =
      '<section data-module-id="opening" data-editorial-position="1" data-article-id="lead" data-item-position="1" data-component-type="hero"><h1 data-module-marker>Portada actual</h1></section>'
    const headline = root().querySelector('h1')!
    jest
      .spyOn(headline, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(0, 100, 200, 40))
    const stop = mountHomeMeasurement(
      root(),
      createHomeMeasurement(
        { ...context, home_variant: 'control', opening_treatment: 'current' },
        new Set()
      )
    )
    expose(headline)
    jest.advanceTimersByTime(1000)
    expect(events()[0]).toMatchObject({
      event: 'MODULE_IMPRESSION',
      module_id: 'opening',
      home_variant: 'control'
    })
    stop()
  })
})
