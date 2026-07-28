import { act, fireEvent, render, screen } from '@testing-library/react'
import { RegisterFormFields } from '@components/auth/RegisterFormFields'

const mockSignUp = jest.fn()
const mockSubscribe = jest.fn().mockResolvedValue(undefined)

jest.mock('@lib/supabase/client', () => ({
  createClient: () => ({ auth: { signUp: mockSignUp } })
}))

jest.mock('@app/actions/subscribe', () => ({
  subscribe: (...args: unknown[]) => mockSubscribe(...args)
}))

const flushPromises = () =>
  act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })

function fillRequiredFields() {
  fireEvent.change(screen.getByPlaceholderText('Tu nombre'), {
    target: { value: 'Ana' }
  })
  fireEvent.change(screen.getByPlaceholderText('Tu apellido'), {
    target: { value: 'Pérez' }
  })
  fireEvent.change(screen.getByPlaceholderText('tu@email.com'), {
    target: { value: 'ana@example.com' }
  })
  fireEvent.change(screen.getByPlaceholderText('Min. 8 caracteres'), {
    target: { value: 'password123' }
  })
  fireEvent.change(screen.getByPlaceholderText('Repite la contraseña'), {
    target: { value: 'password123' }
  })
  fireEvent.click(screen.getByRole('checkbox', { name: /acepto los/i }))
}

describe('RegisterFormFields', () => {
  beforeEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  test('shows validation errors on empty submit', async () => {
    render(<RegisterFormFields onSwitchToLogin={() => {}} />)

    fireEvent.click(screen.getByRole('button', { name: /^registrarse$/i }))
    await flushPromises()

    expect(
      screen.getByText('El nombre debe tener al menos 2 caracteres')
    ).toBeInTheDocument()
    expect(
      screen.getByText('El apellido debe tener al menos 2 caracteres')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Ingrese un correo electrónico válido')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Debe aceptar los términos y condiciones')
    ).toBeInTheDocument()
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  test('registers, skips the newsletter action, and shows the confirmation screen', async () => {
    mockSignUp.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
    render(<RegisterFormFields onSwitchToLogin={() => {}} />)

    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: /^registrarse$/i }))
    await flushPromises()

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'ana@example.com',
      // eslint-disable-next-line sonarjs/no-hardcoded-passwords
      password: 'password123',
      options: {
        data: { full_name: 'Ana Pérez' },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    expect(mockSubscribe).not.toHaveBeenCalled()
    expect(
      screen.getByText(/hemos enviado un correo de confirmación/i)
    ).toBeInTheDocument()
    expect(screen.getByText('ana@example.com')).toBeInTheDocument()
  })

  test('subscribes to the newsletter when opted in', async () => {
    mockSignUp.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
    render(<RegisterFormFields onSwitchToLogin={() => {}} />)

    fillRequiredFields()
    fireEvent.click(
      screen.getByRole('checkbox', { name: /quiero recibir noticias/i })
    )
    fireEvent.click(screen.getByRole('button', { name: /^registrarse$/i }))
    await flushPromises()

    expect(mockSubscribe).toHaveBeenCalledTimes(1)
    const formData = mockSubscribe.mock.calls[0][1] as FormData
    expect(formData.get('email')).toBe('ana@example.com')
  })

  test('shows a translated error and stays on the form on signUp failure', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'User already registered' }
    })
    render(<RegisterFormFields onSwitchToLogin={() => {}} />)

    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: /^registrarse$/i }))
    await flushPromises()

    expect(
      screen.getByText(
        'Este correo ya está registrado. Por favor, intenta iniciar sesión.'
      )
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/hemos enviado un correo de confirmación/i)
    ).not.toBeInTheDocument()
  })

  test('"Ir al inicio de sesión" from the confirmation screen calls onSwitchToLogin', async () => {
    mockSignUp.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
    const onSwitchToLogin = jest.fn()
    render(<RegisterFormFields onSwitchToLogin={onSwitchToLogin} />)

    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: /^registrarse$/i }))
    await flushPromises()

    fireEvent.click(screen.getByRole('button', { name: /ir al inicio de sesión/i }))
    expect(onSwitchToLogin).toHaveBeenCalledTimes(1)
  })

  test('the "Inicia sesión aquí" link calls onSwitchToLogin', () => {
    const onSwitchToLogin = jest.fn()
    render(<RegisterFormFields onSwitchToLogin={onSwitchToLogin} />)

    fireEvent.click(screen.getByText('Inicia sesión aquí'))
    expect(onSwitchToLogin).toHaveBeenCalledTimes(1)
  })
})
