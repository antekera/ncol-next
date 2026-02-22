import { render, screen } from '@testing-library/react'
import { MobileRankingLinks } from '..'
import '@testing-library/jest-dom'

describe('MobileRankingLinks', () => {
  it('renders the links', () => {
    render(<MobileRankingLinks />)
    expect(screen.getByText('+ Leído')).toBeInTheDocument()
    expect(screen.getByText('+ Visto Hoy')).toBeInTheDocument()
    expect(screen.getByText('Denuncias')).toBeInTheDocument()
  })

  it('has the correct href attributes', () => {
    render(<MobileRankingLinks />)
    expect(screen.getByText('+ Leído').closest('a')).toHaveAttribute(
      'href',
      '/mas-leidos'
    )
    expect(screen.getByText('+ Visto Hoy').closest('a')).toHaveAttribute(
      'href',
      '/mas-visto-hoy'
    )
    expect(screen.getByText('Denuncias').closest('a')).toHaveAttribute(
      'href',
      '/denuncias'
    )
  })
})
