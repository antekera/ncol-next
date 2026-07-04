import { render, screen } from '@testing-library/react'
import { CategorySubmenu } from '..'

describe('CategorySubmenu', () => {
  test('renders submenu items for national categories', () => {
    render(<CategorySubmenu slug='nacionales' />)

    expect(screen.getByText('Política')).toBeInTheDocument()
    expect(screen.getByText('Economía')).toBeInTheDocument()
    expect(screen.getByText('Servicios')).toBeInTheDocument()
  })
})
