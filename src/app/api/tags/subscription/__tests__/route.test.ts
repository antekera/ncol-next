/** @jest-environment node */
import { NextRequest } from 'next/server'
import { GET, POST, DELETE } from '../route'

jest.mock('@lib/db', () => ({
  db: new Proxy(
    {},
    {
      get: () => {
        throw new Error('Subscriptions must not access the database')
      }
    }
  )
}))
jest.mock('@lib/supabase/server', () => ({
  createClient: () => {
    throw new Error('Disabled subscriptions must not load auth')
  }
}))

describe('disabled tag subscriptions', () => {
  it.each([
    ['GET', GET],
    ['POST', POST],
    ['DELETE', DELETE]
  ] as const)(
    '%s returns 410 without auth, body parsing or storage access',
    async (method, handler) => {
      const request = new NextRequest(
        'https://example.com/api/tags/subscription/?tagSlug=cine',
        {
          method,
          ...(method === 'GET' ? {} : { body: 'invalid json' })
        }
      )
      const routeHandler: (request: NextRequest) => Promise<Response> = handler
      const response = await routeHandler(request)
      expect(response.status).toBe(410)
      expect(await response.json()).toEqual({
        error: 'notifications_disabled',
        subscribed: false
      })
      expect(response.headers.get('Cache-Control')).toBe('no-store')
    }
  )
})
