import { fireEvent, render, screen } from '@testing-library/react'
import { GoToBottom } from '..'

jest.mock('react-intersection-observer', () => ({
  useInView: jest.fn()
}))

import { useInView } from 'react-intersection-observer'

const spyScrollTo = jest.fn()

describe('GoToBottom', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollTo', { value: spyScrollTo })
    spyScrollTo.mockClear()
    document.body.innerHTML = ''
  })

  test('should be visually hidden when footer in view', () => {
    ;(useInView as jest.Mock).mockReturnValue({ ref: jest.fn(), inView: true })
    render(<GoToBottom />)
    const button = screen.getByTestId('button-go-bottom')
    expect(button).toHaveAttribute('aria-hidden', 'true')
    expect(button.className).toContain('opacity-0')
    expect(button.className).toContain('pointer-events-none')
  })

  test('click scrolls to footer when present', () => {
    ;(useInView as jest.Mock).mockReturnValue({ ref: jest.fn(), inView: false })
    const footer = document.createElement('footer')
    footer.className = 'footer'
    // mock position of footer
    ;(footer as any).getBoundingClientRect = () => ({
      top: 300,
      bottom: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => {}
    })
    document.body.appendChild(footer)

    render(<GoToBottom />)
    fireEvent.click(screen.getByTestId('button-go-bottom'))
    expect(spyScrollTo).toHaveBeenCalledWith({
      top: 300,
      left: 0,
      behavior: 'smooth'
    })
  })

  test('click scrolls to bottom when footer missing', () => {
    ;(useInView as jest.Mock).mockReturnValue({ ref: jest.fn(), inView: false })
    // ensure some scrollHeight
    Object.defineProperty(document.body, 'scrollHeight', { value: 1234 })
    render(<GoToBottom />)
    fireEvent.click(screen.getByTestId('button-go-bottom'))
    expect(spyScrollTo).toHaveBeenCalledWith({
      top: document.body.scrollHeight,
      left: 0,
      behavior: 'smooth'
    })
  })
})
