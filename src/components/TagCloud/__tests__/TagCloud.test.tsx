import { render, screen } from '@testing-library/react'
import { TagCloud } from '..'

jest.mock('@lib/generated/seoStaticData', () => ({
  seoStaticData: {
    popularTags: [
      { name: 'Venezuela', href: '/etiqueta/venezuela/' },
      { name: 'Política', href: '/etiqueta/politica/' },
      { name: 'Economía', href: '/etiqueta/economia/' }
    ],
    nationalTags: [],
    categoryTags: {},
    generatedAt: '2026-07-04T00:00:00.000Z'
  }
}))

describe('TagCloud', () => {
  test('renders the default national tags', () => {
    render(<TagCloud />)

    expect(screen.getByText('Etiquetas destacadas')).toBeInTheDocument()
    expect(screen.getByText('Venezuela')).toBeInTheDocument()
    expect(screen.getByText('Política')).toBeInTheDocument()
  })
})
