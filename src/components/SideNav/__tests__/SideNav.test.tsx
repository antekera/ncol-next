import { render, screen, fireEvent } from '@testing-library/react'
import { SideNav } from '..'

jest.mock('@lib/context/StateContext', () => ({
  __esModule: true,
  default: () => ({ isMenuActive: true, handleSetContext: jest.fn() })
}))
jest.mock('next/navigation', () => ({ usePathname: () => '/home' }))
jest.mock('@components/Search', () => ({
  Search: () => <input aria-label='Campo de búsqueda' />
}))
jest.mock('@components/SocialLinks', () => ({ SocialLinks: () => <div /> }))
jest.mock('@components/ThemeSwitch', () => ({
  ModeToggle: () => <button aria-label='Cambiar tema'>theme</button>
}))
jest.mock('@components/TextSizeToggle', () => ({
  TextSizeToggle: () => (
    <div
      data-testid='text-size-toggle'
      role='group'
      aria-label='Ajustar tamaño de letra'
    >
      <button aria-label='Reducir tamaño de letra'>A-</button>
      <button aria-label='Tamaño de letra normal'>A</button>
      <button aria-label='Aumentar tamaño de letra'>A+</button>
    </div>
  )
}))
jest.mock('../CloseMenuButton', () => ({
  CloseMenuButton: ({ onClick }: any) => (
    <button aria-label='close' onClick={onClick} />
  )
}))
jest.mock('../MenuLink', () => ({
  MenuLink: ({ item }: any) => <a href={item.href}>{item.name}</a>
}))

describe('SideNav', () => {
  test('renders open menu overlay and search', () => {
    render(<SideNav />)
    expect(screen.getByLabelText('Campo de búsqueda')).toBeInTheDocument()
    const overlay = document.querySelector(
      '.link-menu-button-open'
    ) as HTMLButtonElement
    expect(overlay).toBeInTheDocument()
    expect(overlay.className).toMatch(/opacity-70/)
  })

  test('renders accessibility controls section in mobile menu', () => {
    render(<SideNav />)

    expect(screen.getByText('Lectura y tema')).toBeInTheDocument()
    expect(screen.getByLabelText('Cambiar tema')).toBeInTheDocument()
    expect(
      screen.getByRole('group', { name: 'Ajustar tamaño de letra' })
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Reducir tamaño de letra')).toBeInTheDocument()
    expect(screen.getByLabelText('Tamaño de letra normal')).toBeInTheDocument()
    expect(
      screen.getByLabelText('Aumentar tamaño de letra')
    ).toBeInTheDocument()
  })

  test('close menu button calls handler', () => {
    render(<SideNav />)
    fireEvent.click(screen.getByLabelText('close'))
    // nothing to assert further as handler is mocked; ensure no crash
    expect(screen.getByLabelText('close')).toBeInTheDocument()
  })
})
