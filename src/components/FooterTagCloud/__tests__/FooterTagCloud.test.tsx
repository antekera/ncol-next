import { render, screen } from '@testing-library/react'
import { FooterTagCloud } from '..'

jest.mock('@lib/generated/seoStaticData', () => ({
  seoStaticData: {
    popularTags: [
      { name: 'Venezuela', href: '/etiqueta/venezuela/' },
      { name: 'Política', href: '/etiqueta/politica/' }
    ],
    nationalTags: [],
    categoryTags: {},
    generatedAt: '2026-07-04T00:00:00.000Z'
  }
}))

describe('FooterTagCloud', () => {
  test('renders the national tags above the footer', () => {
    render(<FooterTagCloud />)

    expect(screen.getByText('Temas de interés')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Venezuela' })).toHaveAttribute(
      'href',
      '/etiqueta/venezuela'
    )
  })
})
