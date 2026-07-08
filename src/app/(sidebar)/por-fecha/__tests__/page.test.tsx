import { render, screen } from '@testing-library/react'
import Page from '../page'

jest.mock('@blocks/content/RecentPosts', () => ({
  Content: () => <div data-testid='recent-posts-content' />
}))

jest.mock('@components/Sidebar', () => ({
  Sidebar: () => <aside data-testid='sidebar' />
}))

jest.mock('@components/Newsletter', () => ({
  Newsletter: () => <div data-testid='newsletter' />
}))

describe('PorFechaPage', () => {
  test('renders the chronological archive page', () => {
    render(<Page />)

    expect(
      screen.getByRole('heading', { name: 'Lo último.' })
    ).toBeInTheDocument()
    expect(screen.getByTestId('recent-posts-content')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
  })
})
