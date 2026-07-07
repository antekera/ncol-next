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

    expect(
      screen.getByRole('link', { name: 'Noticias de Política' })
    ).toHaveAttribute('href', '/categoria/nacionales/politica')
    expect(
      screen.getByRole('link', { name: 'Noticias de la Costa Oriental' })
    ).toHaveAttribute('href', '/categoria/zulia/costa-oriental')
    expect(
      screen.getByRole('link', { name: 'Noticias de Ciencia y Tecnología' })
    ).toHaveAttribute('href', '/categoria/tendencias/ciencia-y-tecnologia')
  })

  test('should match snapshots', () => {
    const { container } = render(<Footer />)
    expect(container).toMatchSnapshot()
  })
})
