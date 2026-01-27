import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DollarCalculator } from '..'
import '@testing-library/jest-dom'
import { useSessionSWR } from '@lib/hooks/useSessionSWR'

// Mock dependencies
jest.mock('@lib/hooks/useSessionSWR', () => ({
  useSessionSWR: jest.fn()
}))

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

const mockRateData = [
  {
    id: 'oficial',
    source: 'Banco Central de Venezuela',
    price: 36.5,
    last_update: '2024-05-20T14:30:00.000Z',
    fetched_at: '2024-05-20T15:00:00.000Z'
  },
  {
    id: 'oficial',
    source: 'Banco Central de Venezuela',
    price: 35.0,
    last_update: '2024-05-19T14:30:00.000Z',
    fetched_at: '2024-05-19T15:00:00.000Z'
  },
  {
    id: 'paralelo',
    source: 'Monitor Dolar',
    price: 40.0,
    last_update: '2024-05-20T14:30:00.000Z',
    fetched_at: '2024-05-20T15:00:00.000Z'
  }
]

describe('DollarCalculator', () => {
  beforeEach(() => {
    ;(useSessionSWR as jest.Mock).mockReset()
  })

  it('renders loading skeleton when isLoading is true', () => {
    ;(useSessionSWR as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true
    })

    const { container } = render(<DollarCalculator />)
    expect(container.querySelector('.mb-8.h-40.w-full')).toBeInTheDocument()
  })

  it('renders null when no rate data is found', () => {
    ;(useSessionSWR as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false
    })

    const { container } = render(<DollarCalculator />)
    expect(container.firstChild).toBeNull()
  })

  it('renders correctly with data', () => {
    ;(useSessionSWR as jest.Mock).mockReturnValue({
      data: mockRateData,
      isLoading: false
    })

    render(<DollarCalculator />)

    // Check title
    expect(screen.getByText('Calculadora de Divisas (BCV)')).toBeInTheDocument()

    // Check rate display (36,50 VES)
    expect(screen.getByText('36,50')).toBeInTheDocument()

    // Check initial conversion (1 USD -> 36,50 VES)
    expect(screen.getByText('36')).toBeInTheDocument()
    expect(screen.getByText(',50')).toBeInTheDocument()
    expect(screen.getAllByText('VES').length).toBeGreaterThanOrEqual(1)
  })

  it('calculates conversion correctly when amount changes (USD -> VES)', async () => {
    ;(useSessionSWR as jest.Mock).mockReturnValue({
      data: mockRateData,
      isLoading: false
    })

    render(<DollarCalculator />)

    const input = screen.getByTestId('imask-input')
    fireEvent.change(input, { target: { value: '2' } })

    await waitFor(() => {
      // 2 * 36.5 = 73.00
      expect(screen.getByText('73')).toBeInTheDocument()
      expect(screen.getByText(',00')).toBeInTheDocument()
    })
  })

  it('switches currency and calculates correctly (VES -> USD)', async () => {
    ;(useSessionSWR as jest.Mock).mockReturnValue({
      data: mockRateData,
      isLoading: false
    })

    render(<DollarCalculator />)

    // Switch to VES
    const select = screen.getByLabelText('Moneda')
    fireEvent.change(select, { target: { value: 'VES' } })

    await waitFor(() => {
      // Default amount is 1 VES. 1 / 36.5 = 0.0273... -> 0,03
      expect(screen.getByText('0')).toBeInTheDocument()
      expect(screen.getByText(',03')).toBeInTheDocument()
      expect(
        screen.queryByText('VES', { selector: '.text-xl' })
      ).not.toBeInTheDocument()
      expect(screen.getByText('$')).toBeInTheDocument()
    })

    // Change amount to 73 VES
    const input = screen.getByTestId('imask-input')
    fireEvent.change(input, { target: { value: '73' } })

    await waitFor(() => {
      // 73 / 36.5 = 2.00
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText(',00')).toBeInTheDocument()
    })
  })
})
