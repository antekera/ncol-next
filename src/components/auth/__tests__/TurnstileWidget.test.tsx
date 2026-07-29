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

describe('verifyTurnstileToken', () => {
  const originalTurnstile = window.turnstile

  afterEach(() => {
    window.turnstile = originalTurnstile
    jest.restoreAllMocks()
  })

  test('returns false when there is no widget response', async () => {
    window.turnstile = undefined
    await expect(verifyTurnstileToken()).resolves.toBe(false)
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

    await expect(verifyTurnstileToken()).resolves.toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/verify-turnstile/',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ token: 'test-token' })
      })
    )
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

    await expect(verifyTurnstileToken()).resolves.toBe(false)
  })
})
