/** @jest-environment node */

import { config, proxy } from '../proxy'
import type { NextRequest } from 'next/server'
import { updateSupabaseSession } from '@lib/supabase/middleware'

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
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches ad-demo requests only when the query value is non-empty', () => {
    expect(config.matcher).toContainEqual({
      source: '/:path*',
      has: [{ type: 'query', key: 'ver-banners', value: '.+' }]
    })
  })

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

  it('does not refresh a Supabase session for public API traffic', async () => {
    await proxy(
      requestFor('/api/track', {
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0'
      })
    )

    expect(updateSupabaseSession).not.toHaveBeenCalled()
  })

  it('refreshes a Supabase session for the authenticated profile page', async () => {
    await proxy(requestFor('/perfil'))

    expect(updateSupabaseSession).toHaveBeenCalledTimes(1)
  })
})
