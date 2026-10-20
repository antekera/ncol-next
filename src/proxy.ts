import { canonicalPath } from '@lib/siteUrl'
import { CMS_URL } from '@lib/constants'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSupabaseSession } from '@lib/supabase/middleware'
import { applyAdDemoFramingHeaders, isAdDemoMode } from '@lib/adDemo'

// Legacy origins are accepted for requests that follow a canonical redirect.
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
  return pathname === '/perfil' || pathname.startsWith('/perfil/')
}

function incomingUrl(request: NextRequest): URL {
  const incoming = new URL(request.url)
  // Next's local server may expose its bind address in request.url. Use only
  // our two exact public Host values; never trust a forwarded host as a target.
  const host = request.headers.get('host')
  if (host === 'noticiascol.com' || host === 'www.noticiascol.com') {
    incoming.hostname = host
    incoming.port = ''
    const protocol = request.headers.get('x-forwarded-proto')
    if (protocol === 'https' || protocol === 'http') {
      incoming.protocol = `${protocol}:`
    }
  }
  return incoming
}

export async function proxy(request: NextRequest) {
  const incoming = incomingUrl(request)
  const pathname = incoming.pathname
  const normalizedPath = canonicalPath(pathname)
  // Preserve existing editorial aliases while combining them with host/slash.
  const destinationPath =
    normalizedPath === '/categoria/nacionales/dolar-hoy/'
      ? '/dolar-hoy/'
      : normalizedPath.replace(/^\/author\/([^/]+)\/$/, '/autor/$1/')
  const isPublicHost = ['noticiascol.com', 'www.noticiascol.com'].includes(
    incoming.hostname
  )
  if (
    destinationPath !== pathname ||
    (isPublicHost && incoming.origin !== CMS_URL)
  ) {
    const destination = new URL(incoming)
    if (isPublicHost) {
      destination.protocol = 'https:'
      destination.hostname = 'www.noticiascol.com'
      destination.port = ''
    }
    destination.pathname = destinationPath
    return NextResponse.redirect(destination, 308)
  }

  if (
    pathname.startsWith('/api/revalidate') ||
    pathname.startsWith('/api/webhooks/wp-publish')
  ) {
    return NextResponse.next()
  }

  // Cache revalidation via ?actualizar=<secret>. All paths match the proxy;
  // only requests with this parameter enter the revalidation branch.
  const { searchParams } = request.nextUrl
  if (searchParams.has('actualizar')) {
    const secret = searchParams.get('actualizar') ?? ''
    const expectedSecret = process.env.REVALIDATE_SECRET

    if (!expectedSecret || secret !== expectedSecret) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const url = new URL(incoming)
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
  // Include assets too: apex requests must canonicalize host without adding /.
  matcher: ['/:path*']
}
