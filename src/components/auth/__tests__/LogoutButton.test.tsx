import { act, fireEvent, render, screen } from '@testing-library/react'
import { LogoutButton } from '@components/auth/LogoutButton'

const push = jest.fn()
const refresh = jest.fn()
const signOut = jest.fn().mockResolvedValue({ error: null })

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh })
}))

jest.mock('@lib/supabase/client', () => ({
  createClient: () => ({ auth: { signOut } })
}))

describe('LogoutButton', () => {
  beforeEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
    signOut.mockResolvedValue({ error: null })
  })

  test('signs out and redirects home', async () => {
    render(<LogoutButton />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /cerrar sesión/i }))
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(signOut).toHaveBeenCalledTimes(1)
    expect(push).toHaveBeenCalledWith('/')
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  test('disables the button while logging out', async () => {
    let resolveSignOut: (value: { error: null }) => void = () => {}
    signOut.mockReturnValue(
      new Promise(resolve => {
        resolveSignOut = resolve
      })
    )
    render(<LogoutButton />)

    const button = screen.getByRole('button', { name: /cerrar sesión/i })
    fireEvent.click(button)
    expect(button).toBeDisabled()

    await act(async () => {
      resolveSignOut({ error: null })
      await Promise.resolve()
    })
  })
})
