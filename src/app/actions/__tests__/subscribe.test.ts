let subscribe: (typeof import('../subscribe'))['subscribe']
const fetchMock = jest.fn()
const originalFetch = global.fetch
const originalEnv = {
  MAILCHIMP_AUDIENCE_ID: process.env.MAILCHIMP_AUDIENCE_ID,
  MAILCHIMP_API_KEY: process.env.MAILCHIMP_API_KEY,
  MAILCHIMP_API_SERVER: process.env.MAILCHIMP_API_SERVER
}

beforeAll(async () => {
  process.env.MAILCHIMP_AUDIENCE_ID = 'test-audience'
  process.env.MAILCHIMP_API_KEY = 'test-key'
  process.env.MAILCHIMP_API_SERVER = 'test-server'
  ;({ subscribe } = await import('../subscribe'))
})

beforeEach(() => {
  fetchMock.mockReset().mockResolvedValue({ status: 200 })
  global.fetch = fetchMock
})

afterAll(() => {
  global.fetch = originalFetch
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
})

test.each(['', 'reader', 'reader@', 'reader@example', 'a..b@example.com'])(
  'rejects invalid newsletter email %s before requesting Mailchimp',
  async email => {
    const data = new FormData()
    data.set('email', email)
    await expect(subscribe(undefined, data)).resolves.toEqual({
      message: 'Email inválido.'
    })
    expect(fetchMock).not.toHaveBeenCalled()
  }
)

test('preserves subscription confirmation for a valid email with a plus alias', async () => {
  const data = new FormData()
  data.set('email', 'reader+noticias@example.com')
  await expect(subscribe(undefined, data)).resolves.toEqual({
    type: 'success',
    message:
      '¡Gracias por suscribirte! Te enviaremos un correo electrónico de confirmación.'
  })
  expect(fetchMock).toHaveBeenCalledWith(
    'https://test-server.api.mailchimp.com/3.0/lists/test-audience/members',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        email_address: 'reader+noticias@example.com',
        status: 'pending'
      })
    })
  )
})
