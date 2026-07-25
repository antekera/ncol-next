import { render, screen } from '@testing-library/react'
import { CategoryRelatedLinks } from '..'

describe('CategoryRelatedLinks', () => {
  test('renders related editorial links for configured categories', () => {
    render(<CategoryRelatedLinks slug='nacionales' />)

    expect(screen.getByText('Lectura recomendada')).toBeInTheDocument()
    expect(screen.getByText('Más leídos')).toBeInTheDocument()
    expect(screen.getByText('Internacionales')).toBeInTheDocument()
  })

  test('returns null for categories without related links', () => {
    const { container } = render(<CategoryRelatedLinks slug='opinion' />)

    expect(container.firstChild).toBeNull()
  })
})
