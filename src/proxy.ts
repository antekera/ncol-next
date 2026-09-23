import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSupabaseSession } from '@lib/supabase/middleware'
import { applyAdDemoFramingHeaders, isAdDemoMode } from '@lib/adDemo'

const ALLOWED_ORIGINS = [
  'https://www.noticiascol.com',
  'https://noticiascol.com',
  'http://localhost:3000'
]

function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const secFetchSite = request.headers.get('sec-fetch-site')
  const secFetchMode = request.headers.get('sec-fetch-mode')

  // 1. Allow direct browser navigation (Address bar)
  // 'curl' does not send these headers automatically.
  if (secFetchMode === 'navigate') {
    return true
  }

  // 2. Allow same-origin requests (App usages)
  if (secFetchSite === 'same-origin') {
    return true
  }

  // 3. Fallback: Standard Origin/Referer checks
  // If both are missing and it's not a navigation/same-origin, block (script/curl)
  if (!origin && !referer) {
    return false
  }

  // Check Origin if present
  if (origin) {
    return ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed))
  }

  // Check Referer if present
  if (referer) {
    return ALLOWED_ORIGINS.some(allowed => referer.startsWith(allowed))
  }

  return false
}

function shouldRefreshSupabaseSession(pathname: string): boolean {
  return (
    pathname === '/perfil' ||
    pathname.startsWith('/perfil/') ||
    pathname === '/api/tags/subscription' ||
    pathname.startsWith('/api/tags/subscription/')
  )
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/api/revalidate') ||
    pathname.startsWith('/api/webhooks/wp-publish')
  ) {
    return NextResponse.next()
  }

  // Cache revalidation via ?actualizar=<secret>. The matcher only runs this
  // branch when that query parameter is present.
  const { searchParams } = request.nextUrl
  if (searchParams.has('actualizar')) {
    const secret = searchParams.get('actualizar') ?? ''
    const expectedSecret = process.env.REVALIDATE_SECRET

    if (!expectedSecret || secret !== expectedSecret) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const url = request.nextUrl.clone()
    url.pathname = '/api/revalidate'
    url.search = `?path=${encodeURIComponent(pathname)}`
    return NextResponse.redirect(url)
  }

  // API Protection (CSRF / Origin Check). Authentication and authorization
  // remain enforced in each route handler; this is only an additional guard.
  if (pathname.startsWith('/api')) {
    const originStatus = isValidOrigin(request)
    if (!originStatus) {
      return new NextResponse(
        JSON.stringify({ message: 'Unauthorized: Invalid Origin or Referer' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }

  const response = NextResponse.next()
  applyAdDemoFramingHeaders(response.headers, isAdDemoMode(searchParams))

  // `getUser()` makes a network request to Supabase. Refresh the session only
  // for authenticated pages/API routes instead of every public page view.
  return shouldRefreshSupabaseSession(pathname)
    ? updateSupabaseSession(request, response)
    : response
}

export const config = {
  matcher: [
    // Keep CSRF/origin protection for API routes.
    '/api/:path*',
    // Refresh Supabase cookies only where the server needs an authenticated user.
    '/perfil/:path*',
    // Preserve the two query-string-dependent behaviors without proxying all
    // public page traffic.
    {
      source: '/:path*',
      has: [{ type: 'query', key: 'actualizar' }]
    },
    {
      source: '/:path*',
      has: [{ type: 'query', key: 'ver-banners', value: '.+' }]
    }
  ]
}
