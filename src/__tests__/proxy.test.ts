/** @jest-environment node */

import { proxy } from '../proxy'
import type { NextRequest } from 'next/server'

jest.mock('@lib/supabase/middleware', () => ({
  updateSupabaseSession: jest.fn((_request, response) => response)
}))

jest.mock('@lib/adDemo', () => ({
  applyAdDemoFramingHeaders: jest.fn(),
  isAdDemoMode: jest.fn().mockReturnValue(false)
}))

const requestFor = (path: string, headers?: HeadersInit) => {
  const url = new URL(path, 'https://www.noticiascol.com')
  return {
    headers: new Headers(headers),
    nextUrl: url,
    url: url.toString()
  } as unknown as NextRequest
}

describe('proxy', () => {
  it('keeps origin protection enabled for the tracking endpoint', async () => {
    const response = await proxy(requestFor('/api/track'))

    expect(response.status).toBe(401)
  })

  it('allows same-origin tracking requests through to the route handler', async () => {
    const response = await proxy(
      requestFor('/api/track', {
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0'
      })
    )

    expect(response.status).toBe(200)
  })
})
