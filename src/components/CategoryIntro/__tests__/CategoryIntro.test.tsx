import { render, screen } from '@testing-library/react'
import { CategoryIntro } from '..'

describe('CategoryIntro', () => {
  test('renders the configured category description', () => {
    render(<CategoryIntro slug='nacionales' />)

    expect(
      screen.getByText(
        /Ultimas noticias nacionales de Venezuela hoy|Últimas noticias nacionales de Venezuela hoy/i
      )
    ).toBeInTheDocument()
  })

  test('returns null for categories without intro copy', () => {
    const { container } = render(<CategoryIntro slug='opinion' />)

    expect(container.firstChild).toBeNull()
  })
})
