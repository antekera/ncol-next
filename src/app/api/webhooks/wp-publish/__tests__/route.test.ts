/** @jest-environment node */
import { NextRequest } from 'next/server'
import { POST } from '../route'

jest.mock('@lib/db', () => ({
  db: new Proxy(
    {},
    {
      get: () => {
        throw new Error('Disabled push must not query recipients')
      }
    }
  )
}))

describe('disabled publication push webhook', () => {
  const originalSecret = process.env.WP_PUSH_WEBHOOK_SECRET
  beforeEach(() => {
    process.env.WP_PUSH_WEBHOOK_SECRET = 'fixture-secret'
    jest
      .spyOn(global, 'fetch')
      .mockRejectedValue(new Error('Push must never be sent'))
  })
  afterEach(() => {
    jest.restoreAllMocks()
  })
  afterAll(() => {
    if (originalSecret === undefined) delete process.env.WP_PUSH_WEBHOOK_SECRET
    else process.env.WP_PUSH_WEBHOOK_SECRET = originalSecret
  })

  function request(secret: string, body: string) {
    return new NextRequest('https://example.com/api/webhooks/wp-publish/', {
      method: 'POST',
      headers: { 'x-webhook-secret': secret },
      body
    })
  }

  it.each([
    'invalid json',
    JSON.stringify({
      postId: '123',
      title: 'Article',
      permalink: '/article/',
      tags: [{ slug: 'cine' }]
    })
  ])(
    'acknowledges publication without parsing, querying or sending: %s',
    async body => {
      const response = await POST(request('fixture-secret', body))
      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({
        ok: true,
        notified: 0,
        reason: 'notifications_disabled'
      })
      expect(response.headers.get('Cache-Control')).toBe('no-store')
      expect(global.fetch).not.toHaveBeenCalled()
    }
  )

  it('still rejects an invalid secret', async () => {
    expect((await POST(request('wrong', '{}'))).status).toBe(401)
  })

  it('still rejects requests when no secret is configured', async () => {
    delete process.env.WP_PUSH_WEBHOOK_SECRET
    expect((await POST(request('', '{}'))).status).toBe(401)
  })
})
