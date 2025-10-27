import { render, screen } from '@testing-library/react'
import { ExchangeRateBanner } from '..'

jest.mock('@blocks/content/MostRecentPostBanner', () => ({
  MostRecentPostBanner: () => <div data-testid='most-recent-banner' />
}))

jest.mock('@lib/context/StateContext', () => ({
  __esModule: true,
  default: () => ({ today: new Date('2025-01-10T12:00:00Z') })
}))

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn()
}))

import useSWR from 'swr'

describe('ExchangeRateBanner', () => {
  test('shows loading skeleton for exchange rate', () => {
    ;(useSWR as jest.Mock).mockReturnValue({ data: undefined, isLoading: true })
    const { container } = render(<ExchangeRateBanner />)
    expect(screen.getByText(/Dólar BCV:/)).toBeInTheDocument()
    // skeleton is present
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  test('renders latest price with up/down symbol', () => {
    const now = '2025-01-10T12:00:00Z'
    const earlier = '2025-01-10T11:00:00Z'
    ;(useSWR as jest.Mock).mockReturnValue({
      isLoading: false,
      data: [
        {
          id: 'oficial',
          source: 'bcv',
          price: 40,
          last_update: now,
          fetched_at: now
        },
        {
          id: 'oficial',
          source: 'bcv',
          price: 39,
          last_update: now,
          fetched_at: earlier
        }
      ]
    })

    render(<ExchangeRateBanner />)

    // price with two decimals
    expect(screen.getByText('40.00')).toBeInTheDocument()
    // arrow indicating higher price
    expect(screen.getByText('▲')).toBeInTheDocument()
    expect(screen.getByTestId('most-recent-banner')).toBeInTheDocument()
  })
})
