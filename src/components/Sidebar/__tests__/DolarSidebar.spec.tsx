import { render, screen } from '@testing-library/react'
import { DolarSidebar } from '../DolarSidebar'
import '@testing-library/jest-dom'
import { DOLAR_HOY_SLUG } from '@lib/constants'

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}))

import useSWR from 'swr'
import { usePathname } from 'next/navigation'

const mockBcvResponse = {
  current: { date: '2024-02-25', usd: 36.5, eur: 39.8 },
  previous: { date: '2024-02-24', usd: 36.2, eur: 39.5 },
  changePercentage: { usd: 0.83, eur: 0.76 }
}

describe('DolarSidebar', () => {
  beforeEach(() => {
    ;(usePathname as jest.Mock).mockReturnValue('/otra-pagina')
    ;(useSWR as jest.Mock).mockReturnValue({
      data: mockBcvResponse,
      isLoading: false
    })
  })

  it('renders the BCV rate and label', () => {
    render(<DolarSidebar />)
    expect(screen.getByText('Dólar BCV oficial')).toBeInTheDocument()
    expect(screen.getByText('36')).toBeInTheDocument()
    expect(screen.getByText(',50')).toBeInTheDocument()
  })

  it('renders the EUR rate', () => {
    render(<DolarSidebar />)
    expect(screen.getByText('39,80')).toBeInTheDocument()
  })

  it('renders positive change percentage', () => {
    render(<DolarSidebar />)
    expect(screen.getByText('+0.8300%')).toBeInTheDocument()
  })

  it('renders CTA link to /dolar-hoy', () => {
    render(<DolarSidebar />)
    expect(screen.getByText('Ir a calculadora')).toBeInTheDocument()
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', `/${DOLAR_HOY_SLUG}`)
  })

  it('returns null when on /dolar-hoy page', () => {
    ;(usePathname as jest.Mock).mockReturnValue(`/${DOLAR_HOY_SLUG}`)
    const { container } = render(<DolarSidebar />)
    expect(container.firstChild).toBeNull()
  })

  it('shows loading skeleton when fetching', () => {
    ;(useSWR as jest.Mock).mockReturnValue({ data: undefined, isLoading: true })
    const { container } = render(<DolarSidebar />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<DolarSidebar className='test-class' />)
    const link = screen.getByRole('link')
    expect(link).toHaveClass('test-class')
  })
})
