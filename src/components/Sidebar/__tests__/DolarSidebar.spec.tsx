import { render, screen } from '@testing-library/react'
import { DolarSidebar } from '../DolarSidebar'
import '@testing-library/jest-dom'
import { DOLAR_HOY_SLUG } from '@lib/constants'

describe('DolarSidebar', () => {
  it('renders correctly', () => {
    render(<DolarSidebar />)
    expect(screen.getByText('Calculadora Dólar')).toBeInTheDocument()
  })

  it('has the correct link', () => {
    render(<DolarSidebar />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', `/${DOLAR_HOY_SLUG}`)
  })

  it('applies custom className', () => {
    const customClass = 'test-custom-class'
    render(<DolarSidebar className={customClass} />)
    const outerDiv = screen.getByRole('link').firstChild
    expect(outerDiv).toHaveClass(customClass)
  })
})
