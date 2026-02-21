import { render, screen } from '@testing-library/react'
import { DenunciaSidebar } from '../DenunciaSidebar'
import '@testing-library/jest-dom'

describe('DenunciaSidebar', () => {
  it('renders correctly', () => {
    render(<DenunciaSidebar />)
    expect(screen.getByText('Denuncias')).toBeInTheDocument()
    expect(screen.getByText(/Envía tu denuncia de forma/i)).toBeInTheDocument()
    expect(screen.getByText('anónima')).toBeInTheDocument()
  })

  it('has the correct link', () => {
    render(<DenunciaSidebar />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/denuncias')
  })

  it('applies custom className', () => {
    const customClass = 'test-custom-class'
    render(<DenunciaSidebar className={customClass} />)
    // The className is applied to the second child of the Link (the div wrapper)
    const outerDiv = screen.getByRole('link').firstChild
    expect(outerDiv).toHaveClass(customClass)
  })
})
