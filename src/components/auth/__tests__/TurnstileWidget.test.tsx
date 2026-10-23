import { render } from '@testing-library/react'
import {
  TurnstileWidget,
  verifyTurnstileToken
} from '@components/auth/TurnstileWidget'

describe('TurnstileWidget (non-production)', () => {
  test('renders nothing outside of production', () => {
    const { container } = render(<TurnstileWidget />)
    expect(container).toBeEmptyDOMElement()
  })
})

function verificationForm(token: string) {
  const form = document.createElement('form')
  const response = document.createElement('input')
  response.type = 'hidden'
  response.name = 'cf-turnstile-response'
  response.value = token
  form.append(response)
  return form
}

describe('verifyTurnstileToken', () => {
  const originalTurnstile = window.turnstile

  afterEach(() => {
    window.turnstile = originalTurnstile
    jest.restoreAllMocks()
  })

  test('returns false when there is no widget response', async () => {
    window.turnstile = undefined
    await expect(verifyTurnstileToken(verificationForm(''))).resolves.toBe(
      false
    )
  })

  test('posts the token and returns true when the server verifies it', async () => {
    window.turnstile = {
      getResponse: () => 'test-token',
      render: jest.fn(),
      reset: jest.fn()
    }
    const fetchMock = jest
      .fn()
      .mockResolvedValue({ json: async () => ({ verified: true }) })
    global.fetch = fetchMock

    await expect(
      verifyTurnstileToken(verificationForm('test-token'))
    ).resolves.toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/verify-turnstile',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ token: 'test-token' })
      })
    )
  })

  test('reads only the submitting form token when another widget exists', async () => {
    const contact = verificationForm('contact-token')
    const login = verificationForm('login-token')
    document.body.append(contact, login)
    const fetchMock = jest.fn().mockResolvedValue({
      json: async () => ({ verified: true })
    })
    global.fetch = fetchMock
    try {
      await expect(verifyTurnstileToken(login)).resolves.toBe(true)
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/auth/verify-turnstile',
        expect.objectContaining({
          body: JSON.stringify({ token: 'login-token' })
        })
      )
      fetchMock.mockClear()
      await expect(verifyTurnstileToken(verificationForm(''))).resolves.toBe(
        false
      )
      await expect(verifyTurnstileToken(null)).resolves.toBe(false)
      expect(fetchMock).not.toHaveBeenCalled()
    } finally {
      contact.remove()
      login.remove()
    }
  })

  test('returns false when the server rejects the token', async () => {
    window.turnstile = {
      getResponse: () => 'test-token',
      render: jest.fn(),
      reset: jest.fn()
    }
    global.fetch = jest
      .fn()
      .mockResolvedValue({ json: async () => ({ verified: false }) })

    await expect(
      verifyTurnstileToken(verificationForm('test-token'))
    ).resolves.toBe(false)
  })
})
