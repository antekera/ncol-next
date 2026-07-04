import { render, screen } from '@testing-library/react'
import { CategoryTagCloud } from '..'

describe('CategoryTagCloud', () => {
  test('renders category-specific tags when configured', () => {
    render(<CategoryTagCloud slug='sucesos' />)

    expect(screen.getByText('#Policía')).toBeInTheDocument()
    expect(screen.getByText('#Accidentes')).toBeInTheDocument()
  })

  test('falls back to national tags when category has no map', () => {
    render(<CategoryTagCloud slug='opinion' />)

    expect(screen.getByText('#Venezuela')).toBeInTheDocument()
    expect(screen.getByText('#Actualidad')).toBeInTheDocument()
  })
})
