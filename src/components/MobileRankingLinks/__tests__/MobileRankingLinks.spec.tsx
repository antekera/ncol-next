import { render, screen } from '@testing-library/react'
import { MobileRankingLinks } from '../index'
import { HOME_QUICK_LINKS } from '@lib/constants'
import '@testing-library/jest-dom'

describe('MobileRankingLinks', () => {
  it('renders a quick links navigation landmark', () => {
    render(<MobileRankingLinks />)
    expect(
      screen.getByRole('navigation', { name: 'Accesos rápidos' })
    ).toBeInTheDocument()
  })

  it('renders the home quick links', () => {
    render(<MobileRankingLinks />)
    HOME_QUICK_LINKS.forEach(link => {
      expect(screen.getByText(link.name)).toBeInTheDocument()
    })
  })

  it('contains correct links for each quick link', () => {
    render(<MobileRankingLinks />)
    HOME_QUICK_LINKS.forEach(linkItem => {
      const link = screen.getByText(linkItem.name).closest('a')
      expect(link).toHaveAttribute('href', linkItem.href)
    })
  })
})
