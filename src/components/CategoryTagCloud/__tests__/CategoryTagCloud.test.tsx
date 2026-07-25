import { render, screen } from '@testing-library/react'
import { CategoryTagCloud } from '..'

jest.mock('@lib/generated/seoStaticData', () => ({
  seoStaticData: {
    popularTags: [
      { name: 'Venezuela', href: '/etiqueta/venezuela/' },
      { name: 'Actualidad', href: '/etiqueta/actualidad/' }
    ],
    nationalTags: [],
    categoryTags: {
      sucesos: [
        { name: 'Policía', href: '/etiqueta/policia/' },
        { name: 'Accidentes', href: '/etiqueta/accidentes/' }
      ]
    },
    generatedAt: '2026-07-04T00:00:00.000Z'
  }
}))

describe('CategoryTagCloud', () => {
  test('renders category-specific tags with "Temas de interés" title', () => {
    render(<CategoryTagCloud slug='sucesos' />)

    expect(screen.getByText('Temas de interés')).toBeInTheDocument()
    expect(screen.getByText('Policía')).toBeInTheDocument()
    expect(screen.getByText('Accidentes')).toBeInTheDocument()
  })

  test('falls back to popular tags with "Temas de interés" title when category has no configured tags', () => {
    render(<CategoryTagCloud slug='opinion' />)

    expect(screen.getByText('Temas de interés')).toBeInTheDocument()
    expect(screen.getByText('Venezuela')).toBeInTheDocument()
    expect(screen.getByText('Actualidad')).toBeInTheDocument()
  })

  test('respects explicit title prop', () => {
    render(<CategoryTagCloud slug='sucesos' title='Mi título' />)

    expect(screen.getByText('Mi título')).toBeInTheDocument()
  })
})
