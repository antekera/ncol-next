import { submitDenuncia } from '../submit-denuncia'

// Mock dependencies
jest.mock('resend')
jest.mock('@sentry/nextjs')
jest.mock('@lib/utils', () => ({
  isProd: true
}))

global.fetch = jest.fn()

describe('submitDenuncia', () => {
  const mockFormData = new FormData()
  mockFormData.append('title', 'Test Denuncia')
  mockFormData.append('estado', 'Zulia')
  mockFormData.append('municipio', 'Cabimas')
  mockFormData.append('parroquia', 'La Rosa')
  mockFormData.append('sector', 'Test Sector')
  mockFormData.append('description', 'Test Description')
  mockFormData.append('contactName', 'Test Contact')
  mockFormData.append('whatsapp', '1234567')
  mockFormData.append('token', 'fake-token')

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.WP_USER = 'test-user'
    // eslint-disable-next-line sonarjs/no-hardcoded-passwords
    process.env.WP_PASSWORD = 'auth-value'
    process.env.TURNSTILE_SECRET_KEY = 'test-secret'
    process.env.NEXT_PUBLIC_WORDPRESS_JSON_URL = 'https://wp.api'
  })

  it('returns error if required fields are missing', async () => {
    const emptyFormData = new FormData()
    const result = await submitDenuncia(emptyFormData)
    expect(result.success).toBe(false)
    expect(result.error).toContain('obligatorios')
  })

  it('processes a valid submission successfully', async () => {
    // Mock Turnstile verify
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    )
    // Mock WP draft post creation
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ post_id: 123 })
      })
    )

    const result = await submitDenuncia(mockFormData)
    expect(result.success).toBe(true)
    expect(result.message).toContain('correctamente')
  })

  it('processes media uploads', async () => {
    const formDataWithMedia = new FormData()
    // Add all required fields
    mockFormData.forEach((value, key) => formDataWithMedia.append(key, value))

    const file = new File(['fake-content'], 'test.png', { type: 'image/png' })
    formDataWithMedia.append('media', file)

    // Mock Turnstile
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    )
    // Mock Media upload
    ;(global.fetch as jest.Mock).mockImplementationOnce(
      () =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ id: 456, source_url: 'https://image.url' })
        }) // Changed http to https
    )
    // Mock WP post creation
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ post_id: 123 })
      })
    )

    const result = await submitDenuncia(formDataWithMedia)
    expect(result.success).toBe(true)
  })

  it('handles Turnstile failure', async () => {
    // Mock Turnstile verify failure
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: false })
      })
    )

    const result = await submitDenuncia(mockFormData)
    expect(result.success).toBe(false)
    expect(result.error).toContain('verificación')
  })
})
