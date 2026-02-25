import { render, screen } from '@testing-library/react'
import { TrendingSidebar } from '../TrendingSidebar'
import '@testing-library/jest-dom'

describe('TrendingSidebar', () => {
  it('renders correctly', () => {
    render(<TrendingSidebar />)
    expect(screen.getByText('Lo más visto hoy')).toBeInTheDocument()
  })

  it('has the correct link', () => {
    render(<TrendingSidebar />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/mas-visto-hoy')
  })

  it('applies custom className', () => {
    const customClass = 'test-custom-class'
    render(<TrendingSidebar className={customClass} />)
    const outerDiv = screen.getByRole('link').firstChild
    expect(outerDiv).toHaveClass(customClass)
  })
})
