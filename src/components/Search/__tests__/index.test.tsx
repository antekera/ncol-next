import { fireEvent, render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import ContextStateData from '@lib/context/StateContext'
import { Search } from '../index'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

jest.mock('@lib/context/StateContext', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('Search component', () => {
  const mockPush = jest.fn()
  const mockHandleSetContext = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup router mock
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    })

    // Setup context mock
    ;(ContextStateData as jest.Mock).mockReturnValue({
      isMenuActive: false,
      handleSetContext: mockHandleSetContext
    })
  })

  it('renders the search input and button', () => {
    render(<Search />)

    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /buscar/i })).toBeInTheDocument()
  })

  it('updates the input value when user types', () => {
    render(<Search />)

    const input = screen.getByPlaceholderText('Buscar...') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'test search' } })

    expect(input.value).toBe('test search')
  })

  it('does not call router.push when form is submitted with empty input', () => {
    render(<Search />)

    const form = screen.getByRole('button', { name: /buscar/i }).closest('form')
    fireEvent.submit(form!)

    expect(mockPush).not.toHaveBeenCalled()
    expect(mockHandleSetContext).not.toHaveBeenCalled()
  })

  it('calls router.push with encoded search term when form is submitted', () => {
    render(<Search />)

    const input = screen.getByPlaceholderText('Buscar...')
    fireEvent.change(input, { target: { value: 'noticias recientes' } })

    const form = screen.getByRole('button', { name: /buscar/i }).closest('form')
    fireEvent.submit(form!)

    expect(mockPush).toHaveBeenCalledWith('/busqueda?q=noticias%20recientes')
  })

  it('trims the search term before encoding', () => {
    render(<Search />)

    const input = screen.getByPlaceholderText('Buscar...')
    fireEvent.change(input, { target: { value: '  test with spaces  ' } })

    const form = screen.getByRole('button', { name: /buscar/i }).closest('form')
    fireEvent.submit(form!)

    expect(mockPush).toHaveBeenCalledWith('/busqueda?q=test%20with%20spaces')
  })

  it('toggles the menu state when form is submitted', () => {
    render(<Search />)

    const input = screen.getByPlaceholderText('Buscar...')
    fireEvent.change(input, { target: { value: 'test' } })

    const form = screen.getByRole('button', { name: /buscar/i }).closest('form')
    fireEvent.submit(form!)

    expect(mockHandleSetContext).toHaveBeenCalledWith({
      isMenuActive: true
    })
  })

  it('handles special characters in search term', () => {
    render(<Search />)

    const input = screen.getByPlaceholderText('Buscar...')
    fireEvent.change(input, { target: { value: 'test&query+param?' } })

    const form = screen.getByRole('button', { name: /buscar/i }).closest('form')
    fireEvent.submit(form!)

    expect(mockPush).toHaveBeenCalledWith('/busqueda?q=test%26query%2Bparam%3F')
  })
})
