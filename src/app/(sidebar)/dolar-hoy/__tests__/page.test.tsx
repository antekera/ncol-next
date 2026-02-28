import { render, screen } from '@testing-library/react'
import Page from '../page'
import '@testing-library/jest-dom'

jest.mock('@components/DollarCalculator', () => ({
  DollarCalculator: () => <div data-testid='dollar-calculator' />
}))

jest.mock('@blocks/content/CategoryPosts', () => ({
  Content: ({ slug }: { slug: string }) => (
    <div data-testid='category-content'>{slug}</div>
  )
}))

jest.mock('@components/PageTitle', () => ({
  PageTitle: ({ text }: { text: string }) => <h1>{text}</h1>
}))

jest.mock('@components/Sidebar', () => ({
  Sidebar: () => <aside data-testid='sidebar' />
}))

describe('DolarHoy Page', () => {
  it('renders correct components', () => {
    render(<Page />)
    expect(
      screen.getByRole('heading', { name: 'Dólar Hoy' })
    ).toBeInTheDocument()
    expect(screen.getByTestId('dollar-calculator')).toBeInTheDocument()
    expect(screen.getByTestId('category-content')).toHaveTextContent(
      'dolar-hoy'
    )
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
  })

  it('generates correct metadata', async () => {
    const { generateMetadata } = await import('../page')
    const metadata = await generateMetadata()
    expect(metadata.title).toBeDefined()
  })
})
