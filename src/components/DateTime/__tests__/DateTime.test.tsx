import { render, screen } from '@testing-library/react'
import { DateTime } from '..'

jest.mock('@lib/context/StateContext', () => ({
  __esModule: true,
  default: () => ({ today: new Date(2000, 0, 1) })
}))

describe('DateTime', () => {
  test('shows formatted today when dateString is not provided', () => {
    render(<DateTime />)
    expect(screen.getByText(/enero 01, 2000/i)).toBeInTheDocument()
  })

  test('shows formal format when formal flag is set', () => {
    render(<DateTime formal />)
    expect(screen.getByText(/01 de enero de 2000/i)).toBeInTheDocument()
  })

  test('uses dateString when provided', () => {
    render(<DateTime dateString='2001-01-01T12:00:00' />)
    expect(screen.getByText(/enero 01, 2001/i)).toBeInTheDocument()
  })
})
