import { render, screen } from '@testing-library/react'
import { RateCard } from '../SidebarFeeds'
it('shows both official currencies and the existing calculator destination', () => {
  render(
    <RateCard
      data={{
        current: { date: '2026-10-17', usd: 980.25, eur: 1036.1 },
        previous: { date: '2026-10-16', usd: 976, eur: 1030 },
        changePercentage: { usd: 0.42, eur: 0.35 }
      }}
    />
  )
  expect(screen.getByText('980,25')).toBeVisible()
  expect(screen.getByText('1.036,10')).toBeVisible()
  expect(screen.getByRole('link', { name: /Ver calculadora/ })).toHaveAttribute(
    'href',
    expect.stringContaining('/dolar-hoy')
  )
})
it('does not invent rates when the data source is unavailable', () => {
  render(<RateCard />)
  expect(screen.getAllByText('—')).toHaveLength(2)
  expect(screen.getByRole('link', { name: /Ver calculadora/ })).toBeVisible()
})
