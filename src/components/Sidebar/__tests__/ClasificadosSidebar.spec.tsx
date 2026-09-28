import { render, screen } from '@testing-library/react'
import { ClasificadosSidebar } from '../ClasificadosSidebar'
import '@testing-library/jest-dom'

describe('ClasificadosSidebar', () => {
  it('links to the Clasificados service in a new tab', () => {
    render(<ClasificadosSidebar />)

    const link = screen.getByRole('link', { name: 'Clasificados' })
    expect(link).toHaveAttribute(
      'href',
      'https://clasificados.noticiascol.com/'
    )
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link.firstElementChild).toHaveClass(
      'from-yellow-500',
      'via-amber-600',
      'to-yellow-800'
    )
  })
})
