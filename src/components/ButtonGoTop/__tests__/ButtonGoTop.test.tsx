import { render, screen, fireEvent } from '@testing-library/react'

import { ButtonGoTop } from '..'

const spyScrollTo = jest.fn()

describe('ButtonGoTop', () => {
  beforeEach(() => {
    Object.defineProperty(global.window, 'scrollTo', { value: spyScrollTo })
    spyScrollTo.mockClear()
  })
  test('should match snapshot', () => {
    const { container } = render(<ButtonGoTop />)
    expect(container.firstChild).toMatchSnapshot()
  })

  test('should call window scroll onClick', () => {
    render(<ButtonGoTop />)
    const button = screen.getByTestId('button-go-top')
    fireEvent.click(button)
    expect(spyScrollTo).toHaveBeenCalledWith({
      left: 0,
      top: 0,
      behavior: 'smooth'
    })
  })
})
