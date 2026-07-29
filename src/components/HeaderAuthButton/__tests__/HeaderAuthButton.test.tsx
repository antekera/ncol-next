import { act, fireEvent, render, screen } from '@testing-library/react'
import { GA_EVENTS, PROFILE_PATH } from '@lib/constants'
import { HeaderAuthButton } from '..'

const mockGetUser = jest.fn()
const openLoginModal = jest.fn()

jest.mock('@lib/supabase/client', () => ({
  createClient: () => ({ auth: { getUser: mockGetUser } })
}))

jest.mock('@components/auth/LoginModalContext', () => ({
  useLoginModal: () => ({ openLoginModal })
}))

jest.mock('@lib/utils', () => ({
  GAEvent: jest.fn()
}))

import { GAEvent } from '@lib/utils'

const flushPromises = () =>
  act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })

describe('HeaderAuthButton', () => {
  beforeEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  test('renders the login button when logged out and opens the modal with a GA event on click', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    render(<HeaderAuthButton />)
    await flushPromises()

    const button = screen.getByRole('button', { name: /iniciar sesión/i })
    fireEvent.click(button)

    expect(GAEvent).toHaveBeenCalledWith({
      category: GA_EVENTS.LOGIN_ICON.CATEGORY,
      label: GA_EVENTS.LOGIN_ICON.LABEL
    })
    expect(openLoginModal).toHaveBeenCalledTimes(1)
  })

  test('renders a link to the profile page when logged in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    render(<HeaderAuthButton />)
    await flushPromises()

    const link = screen.getByRole('link', { name: /mi perfil/i })
    expect(link).toHaveAttribute('href', PROFILE_PATH)
    expect(screen.queryByRole('button', { name: /iniciar sesión/i })).toBeNull()
  })
})
