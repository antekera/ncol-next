import { render, screen, fireEvent } from '@testing-library/react'
import { DollarCalculator } from '../index'
import { useSessionSWR } from '@lib/hooks/useSessionSWR'
import '@testing-library/jest-dom'

jest.mock('@lib/hooks/useSessionSWR')

// Mock IMaskInput since it doesn't play well with simple fireEvent.change
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

const mockRates = [
  {
    id: 'oficial',
    source: 'BCV',
    price: 36.5,
    last_update: '2024-02-25T10:00:00Z',
    fetched_at: '2024-02-25T10:00:00Z'
  },
  {
    id: 'paralelo',
    source: 'EnParaleloVzla',
    price: 45.2,
    last_update: '2024-02-25T10:00:00Z',
    fetched_at: '2024-02-25T10:00:00Z'
  }
]

describe('DollarCalculator', () => {
  beforeEach(() => {
    ;(useSessionSWR as jest.Mock).mockReturnValue({
      data: mockRates,
      isLoading: false
    })
  })

  it('renders correctly with new title and rate', () => {
    render(<DollarCalculator />)
    expect(screen.getByText('Calculadora de Divisas')).toBeInTheDocument()
    expect(screen.getByText('Tasa del Día')).toBeInTheDocument()

    // BCV rate is displayed
    expect(screen.getByText('36,50')).toBeInTheDocument()
    // Parallel rate (45,20) is no longer displayed by default in the sidebar
    expect(screen.queryByText('45,20')).not.toBeInTheDocument()
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

  it('updates conversion when switching to USD Paralelo', () => {
    render(<DollarCalculator />)
    const select = screen.getByLabelText('MONEDA')
    const input = screen.getByTestId('imask-input')

    fireEvent.change(select, { target: { value: 'USD_PARALELO' } })
    fireEvent.change(input, { target: { value: '1' } })

    // 1 * 45.2 = 45.20
    expect(screen.getByText('45')).toBeInTheDocument()
    expect(screen.getByText(',20')).toBeInTheDocument()
  })

  it('updates conversion from VES to USD', () => {
    render(<DollarCalculator />)
    const select = screen.getByLabelText('MONEDA')
    const input = screen.getByTestId('imask-input')

    fireEvent.change(select, { target: { value: 'VES' } })
    fireEvent.change(input, { target: { value: '45.20' } })

    // 45.20 / 45.20 = 1.00
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText(',00')).toBeInTheDocument()
    expect(screen.getAllByText('$').length).toBeGreaterThanOrEqual(1)
  })
})
