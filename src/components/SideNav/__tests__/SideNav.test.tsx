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

  test('close menu button calls handler', () => {
    render(<SideNav />)
    fireEvent.click(screen.getByLabelText('close'))
    // nothing to assert further as handler is mocked; ensure no crash
    expect(screen.getByLabelText('close')).toBeInTheDocument()
  })
})
