/** @jest-environment node */

import { config, proxy } from '../proxy'
import { NextRequest } from 'next/server'
import { updateSupabaseSession } from '@lib/supabase/middleware'

jest.mock('@lib/supabase/middleware', () => ({
  updateSupabaseSession: jest.fn((_request, response) => response)
}))

const requestFor = (path: string, headers?: HeadersInit) => {
  const url = new URL(path, 'https://www.noticiascol.com')
  return new NextRequest(url, { headers })
}

describe('local Home V2 performance selection', () => {
  let prior: NodeJS.ProcessEnv
  beforeEach(() => {
    prior = process.env
    process.env = {
      ...prior,
      HOME_V2_PREVIEW_ENABLED: 'true',
      HOME_V2_PERFORMANCE_AUDIT: 'true',
      VERCEL: '',
      VERCEL_ENV: ''
    }
  })
  afterEach(() => {
    process.env = prior
  })
  it('rewrites an explicitly selected loopback Home without assigning cookies', async () => {
    const response = await proxy(
      requestFor('http://localhost:3212/?__ncol_home_audit=v2', {
        host: 'localhost:3212'
      })
    )
    expect(response.headers.get('x-middleware-rewrite')).toBe(
      'http://localhost:3212/home-v2-preview/?__ncol_home_audit=v2'
    )
    expect(response.cookies.getAll()).toEqual([])
  })
  it.each([
    [
      'https://www.noticiascol.com/?__ncol_home_audit=v2',
      'www.noticiascol.com'
    ],
    ['http://localhost:3212/?__ncol_home_audit=v2', 'www.noticiascol.com:443'],
    ['http://localhost:3212/', 'localhost:3212'],
    ['http://localhost:3212/?__ncol_home_audit=control', 'localhost:3212'],
    [
      'http://localhost:3212/categoria/zulia/?__ncol_home_audit=v2',
      'localhost:3212'
    ]
  ])('keeps normal routing for %s', async (url, host) => {
    const response = await proxy(requestFor(url, { host }))
    expect(response.headers.get('x-middleware-rewrite')).toBeNull()
  })
  it.each(['HOME_V2_PREVIEW_ENABLED', 'HOME_V2_PERFORMANCE_AUDIT'])(
    'requires %s',
    async flag => {
      delete process.env[flag]
      const response = await proxy(
        requestFor('http://localhost:3212/?__ncol_home_audit=v2')
      )
      expect(response.headers.get('x-middleware-rewrite')).toBeNull()
    }
  )
})

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
  it('does not refresh auth for the retired subscription endpoint', async () => {
    const response = await proxy(
      requestFor('/api/tags/subscription?tagSlug=cine', {
        'sec-fetch-site': 'same-origin'
      })
    )
    expect(response.status).toBe(200)
    expect(updateSupabaseSession).not.toHaveBeenCalled()
  })
  it.each([
    'track',
    'contact',
    'audio/token',
    'audio',
    'reactions',
    'views',
    'tags/subscription',
    'auth/verify-turnstile',
    'opinion/media',
    'opinion/articles',
    'opinion/authors',
    'horoscopo/aries'
  ])(
    'passes slashless /api/%s to its handler without redirecting',
    async endpoint => {
      const response = await proxy(
        requestFor(`/api/${endpoint}`, { 'sec-fetch-site': 'same-origin' })
      )
      expect(response.status).toBe(200)
      expect(response.headers.get('location')).toBeNull()
    }
  )

  it('preserves banner demo query across canonicalization and applies framing headers', async () => {
    const redirect = await proxy(
      requestFor(
        'https://noticiascol.com/categoria/zulia?ver-banners=1&focus=header'
      )
    )
    expect(redirect.status).toBe(308)
    expect(redirect.headers.get('location')).toBe(
      'https://www.noticiascol.com/categoria/zulia/?ver-banners=1&focus=header'
    )
    const response = await proxy(requestFor(redirect.headers.get('location')!))
    expect(response.status).toBe(200)
    expect(response.headers.get('x-frame-options')).toBeNull()
    expect(response.headers.get('content-security-policy')).toContain(
      'https://anunciantes.noticiascol.com'
    )
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow')
  })

  it.each(['', '?ver-banners='])(
    'keeps normal framing for non-demo requests %s',
    async query => {
      const response = await proxy(requestFor(`/categoria/zulia/${query}`))
      expect(response.headers.get('x-frame-options')).toBe('DENY')
      expect(response.headers.get('x-robots-tag')).toBeNull()
    }
  )

  describe('actualizar', () => {
    const previousSecret = process.env.REVALIDATE_SECRET
    beforeEach(() => {
      process.env.REVALIDATE_SECRET = 'test-revalidate-secret'
    })
    afterEach(() => {
      if (previousSecret === undefined) delete process.env.REVALIDATE_SECRET
      else process.env.REVALIDATE_SECRET = previousSecret
    })
    it('preserves the update parameter across canonicalization and triggers revalidation', async () => {
      const redirect = await proxy(
        requestFor(
          'https://noticiascol.com/categoria/zulia?actualizar=test-revalidate-secret'
        )
      )
      const canonical = redirect.headers.get('location')!
      expect(canonical).toBe(
        'https://www.noticiascol.com/categoria/zulia/?actualizar=test-revalidate-secret'
      )
      const response = await proxy(requestFor(canonical))
      expect(response.status).toBe(307)
      const destination = new URL(response.headers.get('location')!)
      expect(destination.pathname).toBe('/api/revalidate')
      expect(destination.searchParams.get('path')).toBe('/categoria/zulia/')
    })
    it('rejects an incorrect update secret', async () => {
      const response = await proxy(
        requestFor('/categoria/zulia/?actualizar=incorrect')
      )
      expect(response.status).toBe(401)
    })
  })
})
