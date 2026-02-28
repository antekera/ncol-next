import { render, screen } from '@testing-library/react'
import { MobileRankingLinks } from '../index'
import { SERVICES_MENU } from '@lib/constants'
import '@testing-library/jest-dom'

describe('MobileRankingLinks', () => {
  it('renders all services from SERVICES_MENU', () => {
    render(<MobileRankingLinks />)
    SERVICES_MENU.forEach(service => {
      expect(screen.getByText(service.name)).toBeInTheDocument()
    })
  })

  it('contains correct links for each service', () => {
    render(<MobileRankingLinks />)
    SERVICES_MENU.forEach(service => {
      const link = screen.getByText(service.name).closest('a')
      expect(link).toHaveAttribute('href', service.href)
      if (service.target) {
        expect(link).toHaveAttribute('target', service.target)
      }
    })
  })
})
