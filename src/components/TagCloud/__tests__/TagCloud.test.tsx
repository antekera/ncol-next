import { render, screen } from '@testing-library/react'
import { TagCloud } from '..'

describe('TagCloud', () => {
  test('renders the default national tags', () => {
    render(<TagCloud />)

    expect(screen.getByText('Etiquetas destacadas')).toBeInTheDocument()
    expect(screen.getByText('#Venezuela')).toBeInTheDocument()
    expect(screen.getByText('#Política')).toBeInTheDocument()
  })
})
