import { submitDenuncia } from '../submit-denuncia'

// Mock dependencies
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: jest.fn().mockResolvedValue({ data: { id: 'test-email-id' } })
      }
    }))
  }
})

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn()
}))

jest.mock('@lib/utils', () => ({
  isProd: true
}))

global.fetch = jest.fn()

describe('submitDenuncia', () => {
  const mockFormDataBase = new FormData()
  mockFormDataBase.append('title', 'Test Denuncia')
  mockFormDataBase.append('estado', 'Zulia')
  mockFormDataBase.append('municipio', 'Cabimas')
  mockFormDataBase.append('parroquia', 'La Rosa')
  mockFormDataBase.append('sector', 'Test Sector')
  mockFormDataBase.append('details', 'Test Details')
  mockFormDataBase.append('involved', 'Test Involved')
  mockFormDataBase.append('timeline', 'Test Timeline')
  mockFormDataBase.append('actions', 'Test Actions')
  mockFormDataBase.append('solution', 'Test Solution')
  mockFormDataBase.append('contactName', 'Test Contact')
  mockFormDataBase.append('whatsapp', '1234567')
  mockFormDataBase.append('contactEmail', 'test@example.com')
  mockFormDataBase.append('token', 'fake-token')

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.WP_USER = 'test-user'
    // eslint-disable-next-line sonarjs/no-hardcoded-passwords
    process.env.WP_PASSWORD = 'auth-value'
    process.env.TURNSTILE_SECRET_KEY = 'test-secret'
    process.env.NEXT_PUBLIC_WORDPRESS_JSON_URL = 'https://wp.api'
    process.env.RESEND_API_KEY = 're_123'
  })

  it('returns error if required fields are missing', async () => {
    const emptyFormData = new FormData()
    const result = await submitDenuncia(emptyFormData)
    expect(result.success).toBe(false)
    expect(result.error).toContain('obligatorios')
  })

  it('returns error if media is missing', async () => {
    const noMediaForm = new FormData()
    mockFormDataBase.forEach((v, k) => noMediaForm.append(k, v))
    const result = await submitDenuncia(noMediaForm)
    expect(result.success).toBe(false)
    expect(result.error).toContain('subir al menos una foto')
  })

  it('processes a valid submission successfully', async () => {
    const formData = new FormData()
    mockFormDataBase.forEach((v, k) => formData.append(k, v))
    formData.append(
      'media',
      new File(['foo'], 'foo.png', { type: 'image/png' })
    )

    // Mock Turnstile verify
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    )
    // Mock Media upload
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 456,
            source_url: 'https://image.url',
            mime_type: 'image/png'
          })
      })
    )
    // Mock WP draft post creation
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ post_id: 123 })
      })
    )

    const result = await submitDenuncia(formData)
    expect(result.success).toBe(true)
    expect(result.message).toContain('correctamente')
  })

  it('handles Turnstile failure', async () => {
    const formData = new FormData()
    mockFormDataBase.forEach((v, k) => formData.append(k, v))
    formData.append(
      'media',
      new File(['foo'], 'foo.png', { type: 'image/png' })
    )

    // Mock Turnstile verify failure
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: false })
      })
    )

    const result = await submitDenuncia(formData)
    expect(result.success).toBe(false)
    expect(result.error).toContain('verificación')
  })

  it('processes video uploads with video tags', async () => {
    const formDataWithVideo = new FormData()
    mockFormDataBase.forEach((v, k) => formDataWithVideo.append(k, v))
    formDataWithVideo.append(
      'media',
      new File(['fake-video'], 'test.mp4', { type: 'video/mp4' })
    )

    // Mock Turnstile
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    )
    // Mock Media upload
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 789,
            source_url: 'https://video.url',
            mime_type: 'video/mp4'
          })
      })
    )
    // Mock WP post creation
    let capturedPayload: any = {}
    ;(global.fetch as jest.Mock).mockImplementationOnce((_url, options) => {
      capturedPayload = JSON.parse(options.body)
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ post_id: 124 })
      })
    })

    const result = await submitDenuncia(formDataWithVideo)
    expect(result.success).toBe(true)
    expect(capturedPayload.content).toContain('<video')
    expect(capturedPayload.content).toContain('type="video/mp4"')
  })
})
