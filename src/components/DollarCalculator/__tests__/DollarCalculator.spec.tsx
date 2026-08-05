import { render, screen, fireEvent } from '@testing-library/react'
import { DollarCalculator } from '../index'
import '@testing-library/jest-dom'

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn()
}))

import useSWR from 'swr'

jest.mock('react-imask', () => ({
  IMaskInput: ({ onAccept, value, id, className }: any) => (
    <input
      data-testid='imask-input'
      id={id}
      value={value}
      onChange={e => onAccept(e.target.value)}
      className={className}
    />
  )
}))

const mockBcvResponse = {
  current: {
    date: '2024-02-25',
    usd: 36.5,
    eur: 39.8
  },
  previous: {
    date: '2024-02-24',
    usd: 36.2,
    eur: 39.5
  },
  changePercentage: {
    usd: 0.83,
    eur: 0.76
  }
}

describe('DollarCalculator', () => {
  beforeEach(() => {
    ;(useSWR as jest.Mock).mockReturnValue({
      data: mockBcvResponse,
      isLoading: false
    })
  })

  it('renders correctly with title and BCV rate', () => {
    render(<DollarCalculator />)
    expect(screen.getByText('Calculadora de Divisas')).toBeInTheDocument()
    expect(screen.getByText('Tasa del Día (BCV)')).toBeInTheDocument()
    expect(screen.getByText('36,50')).toBeInTheDocument()
  })

  it('renders EUR BCV option in select', () => {
    render(<DollarCalculator />)
    expect(screen.getByText('EUR BCV (€)')).toBeInTheDocument()
  })

  it('updates conversion from USD BCV to VES', () => {
    render(<DollarCalculator />)
    const input = screen.getByTestId('imask-input')

    fireEvent.change(input, { target: { value: '2' } })

    // 2 * 36.5 = 73.00
    expect(screen.getByText('73')).toBeInTheDocument()
    expect(screen.getByText(',00')).toBeInTheDocument()
    expect(screen.getAllByText('VES').length).toBeGreaterThanOrEqual(1)
  })

  it('switches to EUR BCV rate and shows EUR label', () => {
    render(<DollarCalculator />)
    const select = screen.getByLabelText('MONEDA')

    fireEvent.change(select, { target: { value: 'EUR_BCV' } })

    expect(screen.getByText('Tasa del Día (EUR BCV)')).toBeInTheDocument()
    expect(screen.getByText('39,80')).toBeInTheDocument()
  })

  it('converts EUR BCV to VES', () => {
    render(<DollarCalculator />)
    const select = screen.getByLabelText('MONEDA')
    const input = screen.getByTestId('imask-input')

    fireEvent.change(select, { target: { value: 'EUR_BCV' } })
    fireEvent.change(input, { target: { value: '1' } })

    // 1 * 39.8 = 39.80
    expect(screen.getByText('39')).toBeInTheDocument()
    expect(screen.getByText(',80')).toBeInTheDocument()
    expect(screen.getAllByText('VES').length).toBeGreaterThanOrEqual(1)
  })

  it('converts VES to USD BCV and EUR BCV', () => {
    render(<DollarCalculator />)
    const select = screen.getByLabelText('MONEDA')
    const input = screen.getByTestId('imask-input')

    fireEvent.change(select, { target: { value: 'VES' } })
    fireEvent.change(input, { target: { value: '36.5' } })

    // 36.5 / 36.5 = 1.00 USD
    expect(screen.getByText('$ (BCV)')).toBeInTheDocument()
    // 36.5 / 39.8 ≈ 0.92 EUR
    expect(screen.getByText('€ (BCV)')).toBeInTheDocument()
  })

  it('updates conversion from VES to USD BCV', () => {
    render(<DollarCalculator />)
    const select = screen.getByLabelText('MONEDA')
    const input = screen.getByTestId('imask-input')

    fireEvent.change(select, { target: { value: 'VES' } })
    fireEvent.change(input, { target: { value: '36.5' } })

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText(',00')).toBeInTheDocument()
    expect(screen.getByText('$ (BCV)')).toBeInTheDocument()
  })

  it('shows loading skeleton when data is loading', () => {
    ;(useSWR as jest.Mock).mockReturnValue({ data: undefined, isLoading: true })
    const { container } = render(<DollarCalculator />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('returns null when no rate data', () => {
    ;(useSWR as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false
    })
    const { container } = render(<DollarCalculator />)
    expect(container.firstChild).toBeNull()
  })
})
