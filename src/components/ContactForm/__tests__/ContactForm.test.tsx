import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactForm from '..'
import { toast } from 'sonner'

jest.mock('sonner', () => ({ toast: { success: jest.fn() } }))

describe('ContactForm', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.useRealTimers()
    ;(global.fetch as any) = jest.fn().mockResolvedValue({
      json: async () => ({ message: 'Mensaje enviado' })
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('renders fields with accessible labels', () => {
    render(<ContactForm />)
    expect(
      screen.getByRole('heading', { name: /contáctanos/i })
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Asunto')).toBeInTheDocument()
    expect(screen.getByLabelText('Mensaje')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /enviar mensaje/i })
    ).toBeInTheDocument()
  })

  test('submits form and shows success toast', async () => {
    render(<ContactForm />)

    await user.type(screen.getByLabelText('Nombre'), 'Juan')
    await user.type(screen.getByLabelText('Email'), 'juan@example.com')
    await user.selectOptions(screen.getByLabelText('Asunto'), 'publicidad')
    await user.type(screen.getByLabelText('Mensaje'), 'Hola!')

    await user.click(screen.getByRole('button', { name: /enviar mensaje/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/contact',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      )
      expect(toast.success).toHaveBeenCalledWith('Mensaje enviado')
    })
  })
})
