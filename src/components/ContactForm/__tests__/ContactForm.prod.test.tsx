import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import ContactForm from '..'
import { toast } from 'sonner'

jest.mock('@lib/utils', () => ({ isProd: true }))
jest.mock('@lib/utils/env', () => ({ isProd: true }))
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

let onReadyCallback: (() => void) | undefined
jest.mock('next/script', () => ({
  __esModule: true,
  default: ({ onReady }: { onReady?: () => void }) => {
    onReadyCallback = onReady
    return null
  }
}))

const renderWidget = jest.fn()
const getResponse = jest.fn()
const reset = jest.fn()
const fetchMock = jest.fn()

function submit(token = 'test-token') {
  const form = screen
    .getByRole('button', { name: /enviar mensaje/i })
    .closest('form')!
  const response = document.createElement('input')
  response.type = 'hidden'
  response.name = 'cf-turnstile-response'
  response.value = token
  form.append(response)
  fireEvent.change(screen.getByLabelText('Nombre'), {
    target: { value: 'Lector' }
  })
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'reader@example.com' }
  })
  fireEvent.change(screen.getByLabelText('Asunto'), {
    target: { value: 'publicidad' }
  })
  fireEvent.change(screen.getByLabelText('Mensaje'), {
    target: { value: 'Consulta' }
  })
  fireEvent.submit(
    screen.getByRole('button', { name: /enviar mensaje/i }).closest('form')!
  )
}

describe('ContactForm in production', () => {
  const originalTurnstile = window.turnstile
  const originalFetch = global.fetch

  beforeEach(() => {
    jest.clearAllMocks()
    onReadyCallback = undefined
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'test-site-key'
    window.turnstile = { render: renderWidget, getResponse, reset }
    getResponse.mockReturnValue('test-token')
    fetchMock.mockReset().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ message: 'Mensaje enviado' })
    })
    global.fetch = fetchMock
  })

  afterEach(() => {
    window.turnstile = originalTurnstile
    global.fetch = originalFetch
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  })

  test('initializes the existing widget only after its script is ready', () => {
    const { rerender } = render(<ContactForm />)
    expect(renderWidget).not.toHaveBeenCalled()
    act(() => {
      onReadyCallback?.()
    })
    rerender(<ContactForm />)
    expect(renderWidget).toHaveBeenCalledTimes(1)
    expect(renderWidget).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      expect.objectContaining({ 'error-callback': expect.any(Function) })
    )
  })

  test('handles challenge failure with a visible recovery message', () => {
    render(<ContactForm />)
    act(() => {
      onReadyCallback?.()
    })
    const options = renderWidget.mock.calls[0][1]
    act(() => {
      expect(options['error-callback']('300030')).toBe(true)
    })
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudo cargar la verificación'
    )
  })

  test('does not send a message without a verification token', async () => {
    getResponse.mockReturnValue('')
    render(<ContactForm />)
    submit('')
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Por favor verifica que no eres un robot.'
      )
    )
    expect(fetchMock).not.toHaveBeenCalled()
    expect(toast.success).not.toHaveBeenCalled()
  })

  test('reports rejected verification as an error and resets the consumed token', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ message: 'Error de validación humana.' })
    })
    render(<ContactForm />)
    submit()
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Error de validación humana.')
    )
    expect(toast.success).not.toHaveBeenCalled()
    expect(reset).toHaveBeenCalledTimes(1)
  })

  test('uses the contact token while another form has its own verification', async () => {
    getResponse.mockReturnValue('other-form-token')
    const otherForm = document.createElement('form')
    const otherResponse = document.createElement('input')
    otherResponse.type = 'hidden'
    otherResponse.name = 'cf-turnstile-response'
    otherResponse.value = 'other-form-token'
    otherForm.append(otherResponse)
    document.body.append(otherForm)
    try {
      render(<ContactForm />)
      submit('contact-token')
      await waitFor(() =>
        expect(fetchMock).toHaveBeenCalledWith(
          '/api/contact',
          expect.objectContaining({
            body: expect.stringContaining('"token":"contact-token"')
          })
        )
      )
      expect(getResponse).not.toHaveBeenCalled()
    } finally {
      otherForm.remove()
    }
  })

  test('handles network failures without discarding the entered message', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    render(<ContactForm />)
    submit()
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Error de conexión. Inténtalo de nuevo.'
      )
    )
    expect(screen.getByLabelText('Mensaje')).toHaveValue('Consulta')
    expect(toast.success).not.toHaveBeenCalled()
  })

  test('shows success only after an accepted response and resets verification', async () => {
    render(<ContactForm />)
    submit()
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Mensaje enviado')
    )
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/contact',
      expect.objectContaining({ body: expect.stringContaining('test-token') })
    )
    expect(reset).toHaveBeenCalledTimes(1)
  })
  test('prevents duplicate submissions while the request is pending', async () => {
    let finish: (() => void) | undefined
    fetchMock.mockImplementation(
      () =>
        new Promise(resolve => {
          finish = () =>
            resolve({
              ok: true,
              status: 200,
              json: async () => ({ message: 'Mensaje enviado' })
            })
        })
    )
    render(<ContactForm />)
    submit()
    expect(screen.getByRole('button', { name: /enviando/i })).toBeDisabled()
    fireEvent.submit(
      screen.getByRole('button', { name: /enviando/i }).closest('form')!
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
    await act(async () => {
      finish?.()
    })
    expect(
      screen.getByRole('button', { name: /enviar mensaje/i })
    ).toBeEnabled()
    expect(screen.getByLabelText('Mensaje')).toHaveValue('')
  })
})
