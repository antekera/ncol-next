import { render, screen } from '@testing-library/react'
import { ExchangeRateBanner } from '..'

jest.mock('@blocks/content/MostRecentPostBanner', () => ({
  MostRecentPostBanner: () => <div data-testid='most-recent-banner' />
}))

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(),
  useSWRConfig: () => ({ cache: new Map() })
}))

import useSWR from 'swr'

const mockBcvResponse = {
  current: { date: '2025-01-10', usd: 40.5, eur: 44.2 },
  previous: { date: '2025-01-09', usd: 39.8, eur: 43.7 },
  changePercentage: { usd: 1.76, eur: 1.14 }
}

describe('ExchangeRateBanner', () => {
  test('shows loading skeleton for exchange rate', () => {
    ;(useSWR as jest.Mock).mockReturnValue({ data: undefined, isLoading: true })
    const { container } = render(<ExchangeRateBanner />)
    expect(screen.getByText(/Dólar BCV:/)).toBeInTheDocument()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  test('renders price with up arrow when rate increased', () => {
    ;(useSWR as jest.Mock).mockReturnValue({
      isLoading: false,
      data: mockBcvResponse
    })
    render(<ExchangeRateBanner />)
    expect(screen.getByText('40.50')).toBeInTheDocument()
    expect(screen.getByText('▲')).toBeInTheDocument()
    expect(screen.getByTestId('most-recent-banner')).toBeInTheDocument()
  })

  test('renders price with down arrow when rate decreased', () => {
    ;(useSWR as jest.Mock).mockReturnValue({
      isLoading: false,
      data: {
        ...mockBcvResponse,
        changePercentage: { usd: -0.5, eur: -0.3 }
      }
    })
    render(<ExchangeRateBanner />)
    expect(screen.getByText('▼')).toBeInTheDocument()
  })

  test('renders price with no symbol when rate is flat', () => {
    ;(useSWR as jest.Mock).mockReturnValue({
      isLoading: false,
      data: { ...mockBcvResponse, changePercentage: { usd: 0, eur: 0 } }
    })
    render(<ExchangeRateBanner />)
    expect(screen.queryByText('▲')).not.toBeInTheDocument()
    expect(screen.queryByText('▼')).not.toBeInTheDocument()
  })
})
