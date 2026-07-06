import { render, screen } from '@testing-library/react'
import { CategorySubmenu } from '..'

describe('CategorySubmenu', () => {
  test('renders submenu items for nacionales', () => {
    render(<CategorySubmenu slug='nacionales' />)

    expect(screen.getByText('Política')).toBeInTheDocument()
  })

  test('renders submenu items for deportes', () => {
    render(<CategorySubmenu slug='deportes' />)

    expect(screen.getByText('Fútbol')).toBeInTheDocument()
    expect(screen.getByText('Béisbol')).toBeInTheDocument()
    expect(screen.getByText('Basket')).toBeInTheDocument()
  })

  test('renders submenu items for zulia', () => {
    render(<CategorySubmenu slug='zulia' />)

    expect(screen.getByText('Costa Oriental')).toBeInTheDocument()
    expect(screen.getByText('Maracaibo')).toBeInTheDocument()
  })

  test('renders nothing for a slug with no submenu', () => {
    const { container } = render(<CategorySubmenu slug='mundo' />)
    expect(container).toBeEmptyDOMElement()
  })
})
