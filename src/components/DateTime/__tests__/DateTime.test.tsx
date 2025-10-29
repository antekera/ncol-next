import { render, screen } from '@testing-library/react'
import { DateTime } from '..'

jest.mock('@lib/context/StateContext', () => ({
  __esModule: true,
  default: () => ({ today: new Date('2000-01-01T00:00:00.000Z') })
}))

describe('DateTime', () => {
  test('shows formatted today when dateString is not provided', () => {
    render(<DateTime />)
    expect(screen.getByText(/diciembre 31, 1999/i)).toBeInTheDocument()
  })

  test('shows formal format when formal flag is set', () => {
    render(<DateTime formal />)
    expect(screen.getByText(/31 de diciembre de 1999/i)).toBeInTheDocument()
  })

  test('uses dateString when provided', () => {
    render(<DateTime dateString='2001-01-01T00:00:00.000Z' />)
    expect(screen.getByText(/diciembre 31, 2000/i)).toBeInTheDocument()
  })
})
