import { act, fireEvent, render, screen } from '@testing-library/react'
import { LoginFormFields } from '@components/auth/LoginFormFields'

const mockSignInWithPassword = jest.fn()

jest.mock('@lib/supabase/client', () => ({
  createClient: () => ({
    auth: { signInWithPassword: mockSignInWithPassword }
  })
}))

jest.mock('@components/auth/GoogleSignInButton', () => ({
  GoogleSignInButton: ({ text }: { text: string }) => <button>{text}</button>
}))

const flushPromises = () =>
  act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })

describe('LoginFormFields', () => {
  beforeEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  test('shows validation errors on empty submit', async () => {
    render(
      <LoginFormFields onSuccess={() => {}} onSwitchToRegister={() => {}} />
    )

    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión$/i }))
    await flushPromises()

    expect(
      screen.getByText('Ingrese un correo electrónico válido')
    ).toBeInTheDocument()
    expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument()
    expect(mockSignInWithPassword).not.toHaveBeenCalled()
  })

  test('signs in and calls onSuccess', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null })
    const onSuccess = jest.fn()
    render(
      <LoginFormFields onSuccess={onSuccess} onSwitchToRegister={() => {}} />
    )

    fireEvent.change(screen.getByPlaceholderText('Ingrese su email'), {
      target: { value: 'reader@example.com' }
    })
    fireEvent.change(screen.getByPlaceholderText('Ingrese su contraseña'), {
      target: { value: 'supersecret' }
    })
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión$/i }))
    await flushPromises()

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'reader@example.com',
      // eslint-disable-next-line sonarjs/no-hardcoded-passwords
      password: 'supersecret'
    })
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  test('shows a translated error and does not call onSuccess on failure', async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: 'Invalid login credentials' }
    })
    const onSuccess = jest.fn()
    render(
      <LoginFormFields onSuccess={onSuccess} onSwitchToRegister={() => {}} />
    )

    fireEvent.change(screen.getByPlaceholderText('Ingrese su email'), {
      target: { value: 'reader@example.com' }
    })
    fireEvent.change(screen.getByPlaceholderText('Ingrese su contraseña'), {
      target: { value: 'wrongpassword' }
    })
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión$/i }))
    await flushPromises()

    expect(
      screen.getByText('Email o contraseña incorrectos. Por favor, verifica tus datos.')
    ).toBeInTheDocument()
    expect(onSuccess).not.toHaveBeenCalled()
  })

  test('toggles password visibility', () => {
    render(
      <LoginFormFields onSuccess={() => {}} onSwitchToRegister={() => {}} />
    )

    const passwordInput = screen.getByPlaceholderText('Ingrese su contraseña')
    expect(passwordInput).toHaveAttribute('type', 'password')

    const toggleButtons = screen.getAllByRole('button')
    const toggleButton = toggleButtons.find(
      button => button.getAttribute('type') === 'button' && !button.textContent
    )
    fireEvent.click(toggleButton!)

    expect(passwordInput).toHaveAttribute('type', 'text')
  })

  test('calls onSwitchToRegister', () => {
    const onSwitchToRegister = jest.fn()
    render(
      <LoginFormFields onSuccess={() => {}} onSwitchToRegister={onSwitchToRegister} />
    )

    fireEvent.click(screen.getByText('Regístrate aquí'))
    expect(onSwitchToRegister).toHaveBeenCalledTimes(1)
  })
})
