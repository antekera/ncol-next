import { mountVideoCarousel } from '../videoCarousel'
import { registerHomeMedia } from '../mediaBridge'

it('waits for gesture release in the fallback, cancels resize and leaves no polling timers', () => {
  jest.useFakeTimers()
  const strip = document.createElement('div')
  strip.innerHTML =
    '<article data-item-position="1"></article><article data-item-position="2"></article>'
  document.body.append(strip)
  Object.defineProperty(strip, 'onscrollend', { value: undefined })
  Object.defineProperty(strip, 'clientWidth', { value: 300 })
  Object.defineProperty(strip, 'scrollWidth', { value: 600 })
  const scrollBy = jest.fn()
  strip.scrollBy = scrollBy
  const rect = jest
    .spyOn(strip, 'getBoundingClientRect')
    .mockReturnValue(new DOMRect(0, 0, 300, 180))
  for (const [index, card] of [...strip.children].entries())
    jest
      .spyOn(card, 'getBoundingClientRect')
      .mockImplementation(
        () => new DOMRect(index * 300 - strip.scrollLeft, 0, 300, 180)
      )
  const navigation = jest.fn()
  const ownerStop = registerHomeMedia(strip, { play: jest.fn(), navigation })
  const carousel = mountVideoCarousel(strip, 0.8)
  strip.dispatchEvent(new Event('pointerdown'))
  strip.scrollLeft = 300
  strip.dispatchEvent(new Event('scroll'))
  jest.advanceTimersByTime(300)
  expect(navigation).not.toHaveBeenCalled()
  window.dispatchEvent(new Event('pointerup'))
  jest.advanceTimersByTime(250)
  expect(navigation).toHaveBeenCalledWith(strip, 1, 2, 'gesture')
  carousel.move('previous')
  expect(scrollBy).toHaveBeenLastCalledWith({
    left: -240,
    behavior: 'smooth'
  })
  window.dispatchEvent(new Event('resize'))
  strip.scrollLeft = 0
  strip.dispatchEvent(new Event('scroll'))
  jest.advanceTimersByTime(6000)
  expect(navigation).toHaveBeenCalledTimes(1)
  const calls = rect.mock.calls.length
  jest.advanceTimersByTime(6000)
  expect(rect).toHaveBeenCalledTimes(calls)
  carousel.stop()
  ownerStop()
  expect(jest.getTimerCount()).toBe(0)
  strip.remove()
  jest.restoreAllMocks()
  jest.useRealTimers()
})

it('emits one completed native scroll, ignores unchanged edges and layout/programmatic scrolling', () => {
  const strip = document.createElement('div')
  strip.innerHTML =
    '<article data-item-position="1"></article><article data-item-position="2"></article>'
  document.body.append(strip)
  Object.defineProperty(strip, 'clientWidth', { value: 300 })
  Object.defineProperty(strip, 'scrollWidth', { value: 600 })
  Object.defineProperty(strip, 'onscrollend', { value: null })
  strip.scrollBy = jest.fn()
  jest
    .spyOn(strip, 'getBoundingClientRect')
    .mockReturnValue(new DOMRect(0, 0, 300, 180))
  for (const [index, card] of [...strip.children].entries())
    jest
      .spyOn(card, 'getBoundingClientRect')
      .mockImplementation(
        () => new DOMRect(index * 300 - strip.scrollLeft, 0, 300, 180)
      )
  const navigation = jest.fn()
  const ownerStop = registerHomeMedia(strip, { play: jest.fn(), navigation })
  const carousel = mountVideoCarousel(strip)
  carousel.move('next')
  expect(navigation).not.toHaveBeenCalled()
  strip.scrollLeft = 300
  strip.dispatchEvent(new Event('scroll'))
  strip.dispatchEvent(new Event('scrollend'))
  strip.dispatchEvent(new Event('scrollend'))
  expect(navigation).toHaveBeenCalledTimes(1)
  expect(navigation).toHaveBeenLastCalledWith(strip, 1, 2, 'arrow')
  carousel.move('next')
  // Native scrollend is not fired when the position cannot change.
  expect(navigation).toHaveBeenCalledTimes(1)
  strip.scrollLeft = 0
  strip.dispatchEvent(new Event('scroll'))
  strip.dispatchEvent(new Event('scrollend'))
  expect(navigation).toHaveBeenCalledTimes(1)
  // Compositors can move the viewport before a passive wheel listener runs.
  strip.scrollLeft = 300
  strip.dispatchEvent(new WheelEvent('wheel', { deltaX: 300 }))
  strip.dispatchEvent(new Event('scroll'))
  strip.dispatchEvent(new Event('scrollend'))
  expect(navigation).toHaveBeenCalledTimes(2)
  expect(navigation).toHaveBeenLastCalledWith(strip, 1, 2, 'gesture')
  carousel.stop()
  ownerStop()
  strip.remove()
  jest.restoreAllMocks()
})

it('preserves a native touch pan when pointercancel precedes its first scroll', () => {
  jest.useFakeTimers()
  const strip = document.createElement('div')
  strip.innerHTML =
    '<article data-item-position="1"></article><article data-item-position="2"></article>'
  document.body.append(strip)
  Object.defineProperty(strip, 'onscrollend', { value: null })
  jest
    .spyOn(strip, 'getBoundingClientRect')
    .mockReturnValue(new DOMRect(0, 0, 300, 180))
  for (const [index, card] of [...strip.children].entries())
    jest
      .spyOn(card, 'getBoundingClientRect')
      .mockImplementation(
        () => new DOMRect(index * 300 - strip.scrollLeft, 0, 300, 180)
      )
  const navigation = jest.fn()
  const ownerStop = registerHomeMedia(strip, { play: jest.fn(), navigation })
  const carousel = mountVideoCarousel(strip)
  strip.dispatchEvent(new Event('pointerdown'))
  window.dispatchEvent(new Event('pointercancel'))
  strip.scrollLeft = 300
  strip.dispatchEvent(new Event('scroll'))
  strip.dispatchEvent(new Event('scrollend'))
  expect(navigation).toHaveBeenCalledWith(strip, 1, 2, 'gesture')
  expect(navigation).toHaveBeenCalledTimes(1)
  // A cancelled touch without translation must expire without claiming a
  // subsequent programmatic movement.
  strip.dispatchEvent(new Event('pointerdown'))
  window.dispatchEvent(new Event('pointercancel'))
  jest.advanceTimersByTime(800)
  strip.scrollLeft = 0
  strip.dispatchEvent(new Event('scroll'))
  strip.dispatchEvent(new Event('scrollend'))
  expect(navigation).toHaveBeenCalledTimes(1)
  carousel.stop()
  ownerStop()
  expect(jest.getTimerCount()).toBe(0)
  strip.remove()
  jest.restoreAllMocks()
  jest.useRealTimers()
})

it('waits for physical touch release after pointer cancellation in the fallback', () => {
  jest.useFakeTimers()
  const strip = document.createElement('div')
  strip.innerHTML =
    '<article data-item-position="1"></article><article data-item-position="2"></article>'
  document.body.append(strip)
  Object.defineProperty(strip, 'onscrollend', { value: undefined })
  jest
    .spyOn(strip, 'getBoundingClientRect')
    .mockReturnValue(new DOMRect(0, 0, 300, 180))
  for (const [index, card] of [...strip.children].entries())
    jest
      .spyOn(card, 'getBoundingClientRect')
      .mockImplementation(
        () => new DOMRect(index * 300 - strip.scrollLeft, 0, 300, 180)
      )
  const navigation = jest.fn()
  const ownerStop = registerHomeMedia(strip, { play: jest.fn(), navigation })
  const carousel = mountVideoCarousel(strip)
  strip.dispatchEvent(new Event('pointerdown'))
  strip.dispatchEvent(new Event('touchstart'))
  window.dispatchEvent(new Event('pointercancel'))
  strip.scrollLeft = 265
  strip.dispatchEvent(new Event('scroll'))
  jest.advanceTimersByTime(350)
  expect(navigation).not.toHaveBeenCalled()
  window.dispatchEvent(new Event('touchend'))
  strip.scrollLeft = 300
  strip.dispatchEvent(new Event('scroll'))
  jest.advanceTimersByTime(250)
  expect(navigation).toHaveBeenCalledWith(strip, 1, 2, 'gesture')
  expect(navigation).toHaveBeenCalledTimes(1)
  carousel.stop()
  ownerStop()
  expect(jest.getTimerCount()).toBe(0)
  strip.remove()
  jest.restoreAllMocks()
  jest.useRealTimers()
})
