import { fireEvent, render, screen } from '@testing-library/react'
import { LoginModal } from '@components/auth/LoginModal'

jest.mock('@components/auth/LoginFormFields', () => ({
  LoginFormFields: ({
    onSuccess,
    onSwitchToRegister
  }: {
    onSuccess: () => void
    onSwitchToRegister: () => void
  }) => (
    <div>
      <button onClick={onSuccess}>mock login success</button>
      <button onClick={onSwitchToRegister}>mock switch to register</button>
    </div>
  )
}))

jest.mock('@components/auth/RegisterFormFields', () => ({
  RegisterFormFields: ({
    onSwitchToLogin
  }: {
    onSwitchToLogin: () => void
  }) => (
    <div>
      <button onClick={onSwitchToLogin}>mock switch to login</button>
    </div>
  )
}))

describe('LoginModal', () => {
  test('shows the login header and form by default', () => {
    render(
      <LoginModal open onOpenChange={() => {}} onSuccess={() => {}} />
    )

    expect(screen.getByText('Inicia sesión')).toBeInTheDocument()
    expect(screen.getByText('mock login success')).toBeInTheDocument()
  })

  test('switches to the register header and form', () => {
    render(
      <LoginModal open onOpenChange={() => {}} onSuccess={() => {}} />
    )

    fireEvent.click(screen.getByText('mock switch to register'))

    expect(screen.getByText('Crear cuenta')).toBeInTheDocument()
    expect(screen.getByText('mock switch to login')).toBeInTheDocument()
    expect(screen.queryByText('Inicia sesión')).not.toBeInTheDocument()
  })

  test('switches back to the login header from register', () => {
    render(
      <LoginModal open onOpenChange={() => {}} onSuccess={() => {}} />
    )

    fireEvent.click(screen.getByText('mock switch to register'))
    fireEvent.click(screen.getByText('mock switch to login'))

    expect(screen.getByText('Inicia sesión')).toBeInTheDocument()
  })

  test('calls onSuccess when the login form succeeds', () => {
    const onSuccess = jest.fn()
    render(<LoginModal open onOpenChange={() => {}} onSuccess={onSuccess} />)

    fireEvent.click(screen.getByText('mock login success'))
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  test('resets to the login mode after the modal is closed and reopened', () => {
    const { rerender } = render(
      <LoginModal open onOpenChange={() => {}} onSuccess={() => {}} />
    )

    fireEvent.click(screen.getByText('mock switch to register'))
    expect(screen.getByText('Crear cuenta')).toBeInTheDocument()

    rerender(
      <LoginModal open={false} onOpenChange={() => {}} onSuccess={() => {}} />
    )
    rerender(
      <LoginModal open onOpenChange={() => {}} onSuccess={() => {}} />
    )

    expect(screen.getByText('Inicia sesión')).toBeInTheDocument()
  })
})
