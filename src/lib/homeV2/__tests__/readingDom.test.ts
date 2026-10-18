import { mountReadingDom } from '../readingDom'

describe('visible destination adapter', () => {
  let intersect: IntersectionObserverCallback
  let observe: jest.Mock
  let stop: () => void
  let focused: boolean
  const article = (id = 'a') => {
    const root = document.createElement('article')
    root.dataset.readingArticleId = id
    root.dataset.readingUri = `/2026/10/17/${id}/`
    root.innerHTML =
      '<h1 data-reading-heading>Article heading</h1><div data-reading-body><p>Genuine editorial body text with more than forty characters for reading.</p></div>'
    document.body.append(root)
    for (const node of root.querySelectorAll('*'))
      jest
        .spyOn(node, 'getBoundingClientRect')
        .mockReturnValue(new DOMRect(0, 100, 300, 100))
    return root
  }
  const enter = (target: Element, visible = true) =>
    intersect(
      [{ target, isIntersecting: visible } as IntersectionObserverEntry],
      {} as IntersectionObserver
    )
  const runtime = () => ({
    hasContext: jest.fn().mockReturnValue(true),
    open: jest.fn().mockResolvedValue({}),
    active: jest.fn().mockResolvedValue({ engaged: false }),
    activity: jest.fn().mockResolvedValue(undefined)
  })
  beforeEach(() => {
    jest.useFakeTimers()
    focused = true
    jest.spyOn(document, 'hasFocus').mockImplementation(() => focused)
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible'
    })
    observe = jest.fn()
    window.IntersectionObserver = jest.fn().mockImplementation(cb => {
      intersect = cb
      return { observe, unobserve: jest.fn(), disconnect: jest.fn() }
    })
  })
  afterEach(() => {
    stop?.()
    document.body.replaceChildren()
    jest.restoreAllMocks()
    jest.useRealTimers()
  })
  it('opens only a visible attributed destination after a continuous second, once per mount', () => {
    const first = article()
    article('prefetched')
    const service = runtime()
    stop = mountReadingDom(service)
    enter(first.querySelector('h1')!)
    enter(first.querySelector('p')!)
    jest.advanceTimersByTime(999)
    expect(service.open).not.toHaveBeenCalled()
    jest.advanceTimersByTime(1)
    expect(service.open).toHaveBeenCalledTimes(1)
    expect(service.open).toHaveBeenCalledWith('/2026/10/17/a/', 'a')
    jest.advanceTimersByTime(5000)
    expect(service.open).toHaveBeenCalledTimes(1)
    expect(service.active).toHaveBeenCalledWith('/2026/10/17/a/', 'a', 5000)
  })
  it('requires actual body text for reading; title alone cannot generate engagement', () => {
    const first = article()
    jest
      .spyOn(first.querySelector('p')!, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(0, 3000, 300, 100))
    const service = runtime()
    stop = mountReadingDom(service)
    enter(first.querySelector('h1')!)
    jest.advanceTimersByTime(35000)
    expect(service.open).toHaveBeenCalledTimes(1)
    expect(service.active).not.toHaveBeenCalled()
  })
  it('does not poll unattributed or background articles and resets dwell on blur', () => {
    const first = article()
    const service = runtime()
    service.hasContext.mockReturnValue(false)
    stop = mountReadingDom(service)
    enter(first.querySelector('h1')!)
    expect(jest.getTimerCount()).toBe(0)
    service.hasContext.mockReturnValue(true)
    window.dispatchEvent(new Event('storage'))
    jest.advanceTimersByTime(700)
    focused = false
    window.dispatchEvent(new Event('blur'))
    expect(jest.getTimerCount()).toBe(0)
    jest.advanceTimersByTime(60000)
    expect(service.open).not.toHaveBeenCalled()
    focused = true
    window.dispatchEvent(new Event('focus'))
    jest.advanceTimersByTime(999)
    expect(service.open).not.toHaveBeenCalled()
    jest.advanceTimersByTime(1)
    expect(service.open).toHaveBeenCalledTimes(1)
  })
  it('excludes occluded body/title and nested appended articles from the parent reading', async () => {
    const parent = article()
    for (const target of parent.querySelectorAll('*'))
      jest
        .spyOn(target, 'getBoundingClientRect')
        .mockReturnValue(new DOMRect(0, 3000, 300, 100))
    const child = article('b')
    parent.append(child)
    const overlay = document.createElement('div')
    overlay.dataset.homeOccluder = 'share-header'
    jest
      .spyOn(overlay, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(0, 0, window.innerWidth, window.innerHeight))
    document.body.append(overlay)
    const service = runtime()
    stop = mountReadingDom(service)
    enter(parent.querySelector('h1')!)
    enter(child.querySelector('h1')!)
    jest.advanceTimersByTime(2000)
    expect(service.open).not.toHaveBeenCalled()
    overlay.remove()
    await Promise.resolve()
    jest.advanceTimersByTime(1100)
    expect(service.open).toHaveBeenCalledTimes(1)
    expect(service.open).toHaveBeenCalledWith('/2026/10/17/b/', 'b')
  })
  it('observes body fragments streamed after the heading was already mounted', async () => {
    const first = article()
    const body = first.querySelector('[data-reading-body]')!
    body.remove()
    const service = runtime()
    stop = mountReadingDom(service)
    first.append(body)
    await Promise.resolve()
    expect(observe).toHaveBeenCalledWith(body.querySelector('p'))
    enter(body.querySelector('p')!)
    jest.advanceTimersByTime(1000)
    expect(service.open).toHaveBeenCalledTimes(1)
  })
  it('never polls geometry of non-intersecting text in a long article', () => {
    const first = article()
    const body = first.querySelector('[data-reading-body]')!
    const offscreen = Array.from({ length: 200 }, () => {
      const paragraph = document.createElement('p')
      paragraph.textContent =
        'An editorial paragraph long enough to be eligible for the reading measurement.'
      body.prepend(paragraph)
      return jest
        .spyOn(paragraph, 'getBoundingClientRect')
        .mockReturnValue(new DOMRect(0, -3000, 300, 100))
    })
    const service = runtime()
    stop = mountReadingDom(service)
    enter(first.querySelector('[data-reading-heading]')!)
    enter(body.lastElementChild!)
    jest.advanceTimersByTime(6000)
    expect(service.active).toHaveBeenCalled()
    expect(offscreen.reduce((sum, spy) => sum + spy.mock.calls.length, 0)).toBe(
      0
    )
    enter(body.lastElementChild!, false)
    jest.advanceTimersByTime(5000)
    expect(service.active).toHaveBeenCalledTimes(1)
  })
})
