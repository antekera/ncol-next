import { render, screen } from '@testing-library/react'
import { Sidebar } from '..'
import '@testing-library/jest-dom'
import { useIsMobile } from '@lib/hooks/useIsMobile'

// Mock the components used inside Sidebar
jest.mock('@components/Newsletter', () => ({
  Newsletter: () => <div data-testid='newsletter'>Newsletter</div>
}))
jest.mock('@components/SidebarRankings', () => ({
  SidebarRankings: () => (
    <div data-testid='sidebar-rankings'>SidebarRankings</div>
  )
}))
jest.mock('@components/Sidebar/DenunciaSidebar', () => ({
  DenunciaSidebar: () => (
    <div data-testid='denuncia-sidebar'>DenunciaSidebar</div>
  )
}))
jest.mock('@components/Sidebar/DolarSidebar', () => ({
  DolarSidebar: () => <div data-testid='dolar-sidebar'>DolarSidebar</div>
}))
jest.mock('@components/Sidebar/HoroscopoSidebar', () => ({
  HoroscopoSidebar: () => (
    <div data-testid='horoscopo-sidebar'>HoroscopoSidebar</div>
  )
}))
jest.mock('@components/Sidebar/AvisosSidebar', () => ({
  AvisosSidebar: () => <div data-testid='avisos-sidebar'>AvisosSidebar</div>
}))
jest.mock('@components/Sidebar/Ad', () => ({
  Ad: ({ offsetTop }: { offsetTop?: number }) => (
    <div data-testid='sidebar-ad'>Ad {offsetTop}</div>
  )
}))

// Mock useIsMobile hook
jest.mock('@lib/hooks/useIsMobile')

describe('Sidebar', () => {
  beforeEach(() => {
    ;(useIsMobile as jest.Mock).mockReturnValue(false)
  })

  it('renders desktop sidebar correctly', () => {
    render(<Sidebar />)
    expect(screen.getByTestId('sidebar-rankings')).toBeInTheDocument()
    expect(screen.getByTestId('denuncia-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('dolar-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('horoscopo-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('avisos-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('newsletter')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-ad')).toBeInTheDocument()
  })

  it('renders rankings before utility modules', () => {
    const { container } = render(<Sidebar />)

    expect(screen.getByText(/herramientas y servicios/i)).toBeInTheDocument()

    const servicesSection = screen
      .getByText(/herramientas y servicios/i)
      .closest('section')

    expect(screen.queryByText(/explora noticiascol/i)).not.toBeInTheDocument()
    expect(container.firstChild).toContainElement(
      screen.getByTestId('sidebar-rankings')
    )
    expect(container.firstChild).toContainElement(
      screen.getByTestId('newsletter')
    )
    expect(servicesSection).toContainElement(
      screen.getByTestId('dolar-sidebar')
    )
    expect(servicesSection).toContainElement(
      screen.getByTestId('horoscopo-sidebar')
    )
    expect(servicesSection).toContainElement(
      screen.getByTestId('denuncia-sidebar')
    )
    expect(servicesSection).toContainElement(
      screen.getByTestId('avisos-sidebar')
    )

    expect(
      container.firstChild?.textContent?.indexOf('SidebarRankings')
    ).toBeLessThan(
      container.firstChild?.textContent?.indexOf('Herramientas y servicios') ??
        0
    )
  })

  it('hides most visited when hideMostVisited prop is true', () => {
    render(<Sidebar hideMostVisited={true} />)
    expect(screen.queryByTestId('sidebar-rankings')).not.toBeInTheDocument()
  })

  it('hides most visited when on mobile', () => {
    ;(useIsMobile as jest.Mock).mockReturnValue(true)
    render(<Sidebar />)
    expect(screen.queryByTestId('sidebar-rankings')).not.toBeInTheDocument()
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
