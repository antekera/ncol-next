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

  it('covers pages and machine endpoints for apex canonicalization', () => {
    expect(config.matcher).toEqual(['/:path*'])
  })

  it('canonicalizes an apex Host behind a local bind address without its port', async () => {
    const response = await proxy(
      requestFor('http' + '://localhost:3017/categoria/zulia?x=1', {
        host: 'noticiascol.com'
      })
    )
    expect(response.headers.get('location')).toBe(
      'https://www.noticiascol.com/categoria/zulia/?x=1'
    )
  })

  it('passes canonical www behind a local bind address', async () => {
    const response = await proxy(
      requestFor('http' + '://localhost:3017/categoria/zulia/', {
        host: 'www.noticiascol.com',
        'x-forwarded-proto': 'https'
      })
    )
    expect(response.status).toBe(200)
  })

  it.each([
    [
      'https://noticiascol.com/categoria/zulia',
      'https://www.noticiascol.com/categoria/zulia/'
    ],
    [
      'https://noticiascol.com/categoria/zulia/',
      'https://www.noticiascol.com/categoria/zulia/'
    ],
    [
      // eslint-disable-next-line sonarjs/no-clear-text-protocols -- verify legacy HTTP redirects
      'http://noticiascol.com/2016/01/02/nota?a=1&a=2&q=a%20b',
      'https://www.noticiascol.com/2016/01/02/nota/?a=1&a=2&q=a%20b'
    ],
    [
      'https://www.noticiascol.com/2026/10/10/nota',
      'https://www.noticiascol.com/2026/10/10/nota/'
    ],
    ['https://noticiascol.com/', 'https://www.noticiascol.com/'],
    [
      'https://noticiascol.com/robots.txt',
      'https://www.noticiascol.com/robots.txt'
    ],
    ['https://noticiascol.com/feed', 'https://www.noticiascol.com/feed'],
    ['https://www.noticiascol.com/feed/', 'https://www.noticiascol.com/feed'],
    [
      'https://noticiascol.com/api/track?x=1',
      'https://www.noticiascol.com/api/track?x=1'
    ],
    [
      'https://noticiascol.com/_next/image?url=a&w=640',
      'https://www.noticiascol.com/_next/image?url=a&w=640'
    ],
    [
      'https://noticiascol.com/author/ana',
      'https://www.noticiascol.com/autor/ana/'
    ],
    [
      'https://noticiascol.com/categoria/nacionales/dolar-hoy',
      'https://www.noticiascol.com/dolar-hoy/'
    ]
  ])('redirects %s directly to %s', async (input, expected) => {
    const response = await proxy(requestFor(input))
    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe(expected)
    expect(updateSupabaseSession).not.toHaveBeenCalled()
  })

  it.each([
    '/robots.txt',
    '/sitemap.xml',
    '/sitemap-0.xml',
    '/news-sitemap.xml',
    '/ads.txt',
    '/feed',
    '/feed.xml',
    '/articles-sitemap/1',
    '/_next/static/chunk.js',
    '/.well-known/acme-challenge/token',
    '/media/logo.svg',
    '/categoria/zulia/',
    '/'
  ])('leaves canonical %s unchanged', async path => {
    const response = await proxy(requestFor(path))
    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
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
    await proxy(requestFor('/perfil/'))

    expect(updateSupabaseSession).toHaveBeenCalledTimes(1)
  })
})
