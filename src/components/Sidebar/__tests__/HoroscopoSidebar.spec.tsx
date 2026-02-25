import { render, screen } from '@testing-library/react'
import { HoroscopoSidebar } from '../HoroscopoSidebar'
import '@testing-library/jest-dom'

describe('HoroscopoSidebar', () => {
  it('renders correctly', () => {
    render(<HoroscopoSidebar />)
    expect(screen.getByText('Horóscopo')).toBeInTheDocument()
  })

  it('has the correct link', () => {
    render(<HoroscopoSidebar />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/horoscopo')
  })

  it('applies custom className', () => {
    const customClass = 'test-custom-class'
    render(<HoroscopoSidebar className={customClass} />)
    const outerDiv = screen.getByRole('link').firstChild
    expect(outerDiv).toHaveClass(customClass)
  })
})
