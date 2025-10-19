import { render, screen } from '@testing-library/react'
import { MobileRankingLinks } from '..'
import '@testing-library/jest-dom'

describe('MobileRankingLinks', () => {
  it('renders the links', () => {
    render(<MobileRankingLinks />)
    expect(screen.getByText('Más leídos')).toBeInTheDocument()
    expect(screen.getByText('Más visto ahora')).toBeInTheDocument()
  })

  it('has the correct href attributes', () => {
    render(<MobileRankingLinks />)
    expect(screen.getByText('Más leídos').closest('a')).toHaveAttribute(
      'href',
      '/mas-leidos'
    )
    expect(
      screen.getByText('Más visto ahora').closest('a')
    ).toHaveAttribute('href', '/mas-visto-ahora')
  })
})