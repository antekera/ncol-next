import { render, screen } from '@testing-library/react'
import { TagPageIntro } from '..'

describe('TagPageIntro', () => {
  test('renders configured tag intro copy', () => {
    render(<TagPageIntro slug='venezuela' />)

    expect(
      screen.getByText(/Noticias y temas clave de Venezuela/i)
    ).toBeInTheDocument()
  })

  test('returns null for unknown tags', () => {
    const { container } = render(<TagPageIntro slug='desconocido' />)

    expect(container.firstChild).toBeNull()
  })
})
