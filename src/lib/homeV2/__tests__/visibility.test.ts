import { observeVisible } from '../visibility'

describe('visible_v1 continuous editorial exposure', () => {
  let callback: IntersectionObserverCallback
  let disconnected: jest.Mock
  const stops: Array<() => void> = []
  const start = (target: Element, send: () => void) => {
    const stop = observeVisible(target, send)
    stops.push(stop)
    return stop
  }
  let element: HTMLElement
  const visible = (ratio: number) =>
    callback(
      [
        {
          target: element,
          isIntersecting: ratio > 0,
          intersectionRatio: ratio,
          boundingClientRect: element.getBoundingClientRect(),
          intersectionRect: element.getBoundingClientRect(),
          rootBounds: null,
          time: 0
        }
      ],
      {} as IntersectionObserver
    )
  beforeEach(() => {
    jest.useFakeTimers()
    element = document.createElement('article')
    document.body.append(element)
    jest
      .spyOn(element, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(0, 100, 200, 100))
    disconnected = jest.fn()
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible'
    })
    window.IntersectionObserver = jest
      .fn()
      .mockImplementation((cb: IntersectionObserverCallback) => {
        callback = cb
        return { observe: jest.fn(), disconnect: disconnected }
      })
  })
  afterEach(() => {
    for (const stop of stops.splice(0)) stop()
    document.body.replaceChildren()
    jest.restoreAllMocks()
    jest.useRealTimers()
  })
  it('never fires at 49% or 999ms and fires once at 50% for 1000 continuous ms', () => {
    const send = jest.fn()
    const stop = start(element, send)
    visible(0.49)
    jest.advanceTimersByTime(2000)
    expect(send).not.toHaveBeenCalled()
    visible(0.5)
    jest.advanceTimersByTime(999)
    expect(send).not.toHaveBeenCalled()
    jest.advanceTimersByTime(1)
    visible(1)
    jest.advanceTimersByTime(2000)
    expect(send).toHaveBeenCalledTimes(1)
    stop()
    expect(disconnected).toHaveBeenCalled()
    expect(window.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { rootMargin: '0px', threshold: [0, 0.5] }
    )
  })
  it('resets on exit and on hidden tabs; resumes only with a fresh intersection', () => {
    const send = jest.fn()
    const stop = start(element, send)
    visible(1)
    jest.advanceTimersByTime(700)
    visible(0.4)
    jest.advanceTimersByTime(500)
    visible(1)
    jest.advanceTimersByTime(700)
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden'
    })
    document.dispatchEvent(new Event('visibilitychange'))
    jest.advanceTimersByTime(2000)
    expect(send).not.toHaveBeenCalled()
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible'
    })
    document.dispatchEvent(new Event('visibilitychange'))
    jest.advanceTimersByTime(2000)
    expect(send).not.toHaveBeenCalled()
    visible(1)
    jest.advanceTimersByTime(1000)
    expect(send).toHaveBeenCalledTimes(1)
    stop()
  })
  it('cancels work on detach and never invents support without IntersectionObserver', () => {
    const send = jest.fn()
    const stop = start(element, send)
    visible(1)
    stop()
    jest.advanceTimersByTime(1000)
    expect(send).not.toHaveBeenCalled()
    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      writable: true,
      value: undefined
    })
    start(element, send)()
    expect(send).not.toHaveBeenCalled()
  })
  it('excludes a covering overlay and starts a fresh second only after it leaves', async () => {
    const overlay = document.createElement('div')
    overlay.dataset.homeOccluder = 'popup'
    jest
      .spyOn(overlay, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(0, 100, 200, 60))
    document.body.append(overlay)
    const send = jest.fn()
    start(element, send)
    visible(1)
    jest.advanceTimersByTime(2000)
    expect(send).not.toHaveBeenCalled()
    overlay.remove()
    await Promise.resolve()
    jest.advanceTimersByTime(999)
    expect(send).not.toHaveBeenCalled()
    jest.advanceTimersByTime(1)
    expect(send).toHaveBeenCalledTimes(1)
  })

  it('resets an in-progress exposure on insertion and removal of a modal', async () => {
    const send = jest.fn()
    start(element, send)
    visible(1)
    jest.advanceTimersByTime(700)
    const overlay = document.createElement('div')
    overlay.dataset.slot = 'dialog-overlay'
    jest
      .spyOn(overlay, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(0, 0, 1024, 768))
    document.body.append(overlay)
    await Promise.resolve()
    jest.advanceTimersByTime(1500)
    expect(send).not.toHaveBeenCalled()
    overlay.remove()
    await Promise.resolve()
    jest.advanceTimersByTime(999)
    expect(send).not.toHaveBeenCalled()
    jest.advanceTimersByTime(1)
    expect(send).toHaveBeenCalledTimes(1)
  })

  it('does not count zero-area or transparent content', async () => {
    const send = jest.fn()
    const box = jest
      .spyOn(element, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect())
    start(element, send)
    visible(1)
    jest.advanceTimersByTime(1500)
    expect(send).not.toHaveBeenCalled()
    box.mockReturnValue(new DOMRect(0, 100, 200, 100))
    element.style.opacity = '0'
    await Promise.resolve()
    jest.advanceTimersByTime(1500)
    expect(send).not.toHaveBeenCalled()
    element.style.opacity = '1'
    await Promise.resolve()
    jest.advanceTimersByTime(1000)
    expect(send).toHaveBeenCalledTimes(1)
  })

  it('unions overlapping coverage instead of subtracting it twice', () => {
    for (const kind of ['header', 'social']) {
      const overlay = document.createElement('div')
      overlay.dataset.homeOccluder = kind
      jest
        .spyOn(overlay, 'getBoundingClientRect')
        .mockReturnValue(new DOMRect(0, 100, 200, 40))
      document.body.append(overlay)
    }
    const send = jest.fn()
    start(element, send)
    visible(1)
    jest.advanceTimersByTime(1000)
    expect(send).toHaveBeenCalledTimes(1)
  })

  it('does not treat the empty pending native-ad frame as an opaque overlay', () => {
    const pending = document.createElement('div')
    pending.dataset.homeOccluder = 'ad-popup'
    pending.setAttribute('aria-hidden', 'true')
    jest
      .spyOn(pending, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(0, 0, 1024, 768))
    document.body.append(pending)
    const send = jest.fn()
    start(element, send)
    visible(1)
    jest.advanceTimersByTime(1000)
    expect(send).toHaveBeenCalledTimes(1)
  })

  it('keeps a visible dwell when an unrelated overlay changes outside the card', async () => {
    const overlay = document.createElement('div')
    overlay.dataset.homeOccluder = 'ad-sticky'
    jest
      .spyOn(overlay, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(0, 600, 200, 100))
    document.body.append(overlay)
    const send = jest.fn()
    start(element, send)
    visible(1)
    jest.advanceTimersByTime(700)
    overlay.textContent = 'Updated ad content'
    await Promise.resolve()
    jest.advanceTimersByTime(300)
    expect(send).toHaveBeenCalledTimes(1)
  })

  it('shares one polling timer only among intersecting candidates and releases it', () => {
    const interval = jest.spyOn(global, 'setInterval')
    const stopFirst = start(element, jest.fn())
    expect(interval).not.toHaveBeenCalled()
    visible(1)
    const second = document.createElement('article')
    jest
      .spyOn(second, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(300, 100, 200, 100))
    document.body.append(second)
    const stopSecond = start(second, jest.fn())
    callback(
      [
        {
          target: second,
          isIntersecting: true,
          intersectionRatio: 1,
          boundingClientRect: second.getBoundingClientRect(),
          intersectionRect: second.getBoundingClientRect(),
          rootBounds: null,
          time: 0
        }
      ],
      {} as IntersectionObserver
    )
    expect(interval).toHaveBeenCalledTimes(1)
    stopFirst()
    stopSecond()
    expect(jest.getTimerCount()).toBe(0)
  })
})
