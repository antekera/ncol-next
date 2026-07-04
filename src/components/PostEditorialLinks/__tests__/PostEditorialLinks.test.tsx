import { render, screen } from '@testing-library/react'
import { PostEditorialLinks } from '..'

describe('PostEditorialLinks', () => {
  test('renders category, tags and editorial routes', () => {
    render(
      <PostEditorialLinks
        categories={{
          type: 'category',
          edges: [
            { node: { name: 'Nacionales', slug: 'nacionales' } },
            { node: { name: 'Sucesos', slug: 'sucesos' } }
          ]
        }}
        tags={{
          edges: [
            { node: { id: '1', name: 'Política', slug: 'politica' } },
            { node: { id: '2', name: 'Economía', slug: 'economia' } }
          ]
        }}
      />
    )

    expect(
      screen.getByRole('heading', { name: 'Sigue explorando esta cobertura' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Nacionales' })).toHaveAttribute(
      'href',
      '/categoria/nacionales'
    )
    expect(screen.getByRole('link', { name: '#Política' })).toHaveAttribute(
      'href',
      '/etiqueta/politica'
    )
    expect(screen.getByText('Más leídos')).toBeInTheDocument()
  })
})
