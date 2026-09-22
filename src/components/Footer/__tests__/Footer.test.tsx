import { render, screen } from '@testing-library/react'
import { Footer } from '..'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useParams() {
    return {
      slug: '/'
    }
  },
  useSearchParams: jest.fn().mockReturnValue(new URLSearchParams())
}))

describe('Footer', () => {
  test('should render expanded static subcategory links', () => {
    render(<Footer />)

    expect(screen.getByRole('link', { name: 'Política' })).toHaveAttribute(
      'href',
      '/categoria/nacionales/politica'
    )
    expect(
      screen.getByRole('link', { name: 'Costa Oriental' })
    ).toHaveAttribute('href', '/categoria/zulia/costa-oriental')
    expect(
      screen.getByRole('link', { name: 'Ciencia y Tecnología' })
    ).toHaveAttribute('href', '/categoria/tendencias/ciencia-y-tecnologia')
  })

  test('renders without the editorial hubs section', () => {
    render(<Footer />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(
      screen.queryByRole('region', { name: 'Secciones editoriales' })
    ).not.toBeInTheDocument()
  })
})
