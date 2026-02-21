import { render, screen } from '@testing-library/react'
import { Sidebar } from '..'
import '@testing-library/jest-dom'
import { useIsMobile } from '@lib/hooks/useIsMobile'

// Mock the components used inside Sidebar
jest.mock('@components/Newsletter', () => ({
  Newsletter: () => <div data-testid='newsletter'>Newsletter</div>
}))
jest.mock('@components/Sidebar/DenunciaSidebar', () => ({
  DenunciaSidebar: () => (
    <div data-testid='denuncia-sidebar'>DenunciaSidebar</div>
  )
}))
jest.mock('@components/Sidebar/Ad', () => ({
  Ad: ({ offsetTop }: { offsetTop?: number }) => (
    <div data-testid='sidebar-ad'>Ad {offsetTop}</div>
  )
}))
jest.mock('@components/SocialLinks', () => ({
  SocialLinks: () => <div data-testid='social-links'>SocialLinks</div>
}))
jest.mock('@components/MostVisitedPosts', () => ({
  MostVisitedPosts: () => <div data-testid='most-visited'>MostVisitedPosts</div>
}))

// Mock useIsMobile hook
jest.mock('@lib/hooks/useIsMobile')

describe('Sidebar', () => {
  beforeEach(() => {
    ;(useIsMobile as jest.Mock).mockReturnValue(false)
  })

  it('renders desktop sidebar correctly', () => {
    render(<Sidebar />)
    expect(screen.getByTestId('social-links')).toBeInTheDocument()
    expect(screen.getByTestId('denuncia-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('newsletter')).toBeInTheDocument()
    expect(screen.getByTestId('most-visited')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-ad')).toBeInTheDocument()
  })

  it('hides most visited when hideMostVisited prop is true', () => {
    render(<Sidebar hideMostVisited={true} />)
    expect(screen.queryByTestId('most-visited')).not.toBeInTheDocument()
  })

  it('hides most visited when on mobile', () => {
    ;(useIsMobile as jest.Mock).mockReturnValue(true)
    render(<Sidebar />)
    expect(screen.queryByTestId('most-visited')).not.toBeInTheDocument()
  })

  it('renders children when provided', () => {
    render(
      <Sidebar>
        <div>Child Content</div>
      </Sidebar>
    )
    expect(screen.getByText('Child Content')).toBeInTheDocument()
  })

  it('passes offsetTop to Ad component', () => {
    render(<Sidebar offsetTop={100} />)
    expect(screen.getByText('Ad 100')).toBeInTheDocument()
  })
})
