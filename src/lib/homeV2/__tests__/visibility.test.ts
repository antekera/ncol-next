import { observeVisible } from '../visibility'

describe('visible_v1 continuous editorial exposure', () => {
  let callback: IntersectionObserverCallback
  let disconnected: jest.Mock
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
    element.remove()
    jest.useRealTimers()
  })
  it('never fires at 49% or 999ms and fires once at 50% for 1000 continuous ms', () => {
    const send = jest.fn()
    const stop = observeVisible(element, send)
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
    const stop = observeVisible(element, send)
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
    const stop = observeVisible(element, send)
    visible(1)
    stop()
    jest.advanceTimersByTime(1000)
    expect(send).not.toHaveBeenCalled()
    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      writable: true,
      value: undefined
    })
    observeVisible(element, send)()
    expect(send).not.toHaveBeenCalled()
  })
})
