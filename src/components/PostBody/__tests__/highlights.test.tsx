import { act, render, screen } from '@testing-library/react'
import { PostBody } from '..'

jest.mock('@components/NcolAdSlot', () => ({ NcolAdSlot: () => null }))

const originalObserver = global.IntersectionObserver
const observers: MockIntersectionObserver[] = []
const observer = () => observers[observers.length - 1]

class MockIntersectionObserver implements IntersectionObserver {
  root = null
  rootMargin = ''
  thresholds = [0.1]
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
  takeRecords = () => []

  constructor(public callback: IntersectionObserverCallback) {
    observers.push(this)
  }

  intersect(target: Element, isIntersecting: boolean) {
    act(() => {
      this.callback(
        [{ target, isIntersecting } as IntersectionObserverEntry],
        this
      )
    })
  }
}

beforeEach(() => {
  global.IntersectionObserver = MockIntersectionObserver
})

afterEach(() => {
  global.IntersectionObserver = originalObserver
})

test('reveals each phrase only as it enters the viewport, without changing its words', () => {
  render(
    <PostBody
      firstParagraph='<p>Inicio: <span class="ncol-highlight">305 venezolanos regresaron al país</span>.</p>'
      secondParagraph='<p><span class="ncol-highlight">Llegaron dos vuelos</span> a Barcelona.</p>'
    />
  )
  const first = screen.getByText('305 venezolanos regresaron al país')
  const second = screen.getByText('Llegaron dos vuelos')
  expect(first.closest('.post-body')).toHaveAttribute('data-reading-body')
  expect(second.closest('.post-body')).toHaveAttribute('data-reading-body')
  expect(observer().observe).toHaveBeenCalledWith(first)
  expect(observer().observe).toHaveBeenCalledWith(second)
  expect(first).toHaveAttribute('data-highlight-state', 'pending')

  observer().intersect(first, false)
  expect(first).toHaveAttribute('data-highlight-state', 'pending')
  observer().intersect(first, true)
  expect(first).toHaveAttribute('data-highlight-state', 'visible')
  expect(observer().unobserve).toHaveBeenCalledWith(first)
  expect(second).toHaveAttribute('data-highlight-state', 'pending')
  expect(first).toHaveTextContent('305 venezolanos regresaron al país')
})

test('observes only highlights belonging to this article instance', () => {
  const outside = document.createElement('span')
  outside.className = 'ncol-highlight'
  document.body.append(outside)
  const { unmount } = render(
    <PostBody
      firstParagraph='<p><span class="ncol-highlight">Una idea central</span></p>'
      secondParagraph=''
    />
  )
  expect(observer().observe).toHaveBeenCalledTimes(1)
  expect(observer().observe).not.toHaveBeenCalledWith(outside)
  unmount()
  expect(observer().disconnect).toHaveBeenCalledTimes(1)
  outside.remove()
})

test('supports highlights in older articles', () => {
  render(
    <PostBody
      firstParagraph='<p><span class="destacador destacado">Resaltado anterior</span></p>'
      secondParagraph=''
    />
  )
  const phrase = screen.getByText('Resaltado anterior')
  observer().intersect(phrase, true)
  expect(phrase).toHaveClass('active')
  expect(observer().unobserve).toHaveBeenCalledWith(phrase)
})

test('observes new content without restarting phrases already revealed', () => {
  const firstParagraph =
    '<p><span class="ncol-highlight">Primera idea</span></p>'
  const { rerender } = render(
    <PostBody firstParagraph={firstParagraph} secondParagraph='' />
  )
  const first = screen.getByText('Primera idea')
  observer().intersect(first, true)
  const previousObserver = observer()
  rerender(
    <PostBody
      firstParagraph={firstParagraph}
      secondParagraph='<p><span class="ncol-highlight">Segunda idea</span></p>'
    />
  )
  expect(previousObserver.disconnect).toHaveBeenCalledTimes(1)
  expect(first).toHaveAttribute('data-highlight-state', 'visible')
  expect(observer().observe).not.toHaveBeenCalledWith(first)
  expect(observer().observe).toHaveBeenCalledWith(
    screen.getByText('Segunda idea')
  )
})

test('leaves the static marker available if IntersectionObserver is unavailable', () => {
  Reflect.deleteProperty(global, 'IntersectionObserver')
  render(
    <PostBody
      firstParagraph='<p><span class="ncol-highlight">Una idea central</span></p>'
      secondParagraph=''
    />
  )
  expect(screen.getByText('Una idea central')).not.toHaveAttribute(
    'data-highlight-state'
  )
})
