import { render, screen } from '@testing-library/react'
import { AvisosSidebar } from '../AvisosSidebar'
import '@testing-library/jest-dom'

describe('AvisosSidebar', () => {
  it('renders correctly', () => {
    render(<AvisosSidebar />)
    expect(screen.getByText('Avisos Legales')).toBeInTheDocument()
  })

  it('has the correct link', () => {
    render(<AvisosSidebar />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://legales.noticiascol.com/')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('applies custom className', () => {
    const customClass = 'test-custom-class'
    render(<AvisosSidebar className={customClass} />)
    const outerDiv = screen.getByRole('link').firstChild
    expect(outerDiv).toHaveClass(customClass)
  })
})
