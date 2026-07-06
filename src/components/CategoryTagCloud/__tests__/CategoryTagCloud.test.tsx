import { render, screen } from '@testing-library/react'
import { CategoryTagCloud } from '..'

jest.mock('@lib/generated/seoStaticData', () => ({
  seoStaticData: {
    nationalTags: [
      { name: 'Venezuela', href: '/etiqueta/venezuela/' },
      { name: 'Actualidad', href: '/etiqueta/actualidad/' }
    ],
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
  test('renders category-specific tags when configured', () => {
    render(<CategoryTagCloud slug='sucesos' />)

    expect(screen.getByText('#Policía')).toBeInTheDocument()
    expect(screen.getByText('#Accidentes')).toBeInTheDocument()
  })

  test('renders nothing when category has no configured tags', () => {
    const { container } = render(<CategoryTagCloud slug='opinion' />)

    expect(container).toBeEmptyDOMElement()
  })
})
