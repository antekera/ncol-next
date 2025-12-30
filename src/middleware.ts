import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimit = new Map()
const RATE_LIMIT_WINDOW = 60 * 1000
const MAX_REQUESTS = 60

const BLOCKED_USER_AGENTS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /headless/i,
  /scraper/i,
  /python/i,
  /curl/i,
  /wget/i,
  /phantom/i,
  /selenium/i
]

const ALLOWED_ORIGINS = [
  'https://www.noticiascol.com',
  'https://noticiascol.com',
  'http://localhost:3000'
]

function isBot(userAgent: string): boolean {
  return BLOCKED_USER_AGENTS.some(pattern => pattern.test(userAgent))
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW

  // Clean old entries
  for (const [key, data] of rateLimit.entries()) {
    if (data.timestamp < windowStart) {
      rateLimit.delete(key)
    }
  }

  const currentData = rateLimit.get(ip) || { count: 0, timestamp: now }

  if (currentData.timestamp < windowStart) {
    currentData.count = 1
    currentData.timestamp = now
  } else {
    currentData.count++
  }

  rateLimit.set(ip, currentData)
  return currentData.count <= MAX_REQUESTS
}

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  const userAgent = request.headers.get('user-agent') || ''

  // Ignore routes that shouldn't pass through middleware
  const isStaticFile =
    /\.(ico|png|jpg|jpeg|svg|css|js|webp|ttf|woff|woff2|txt|xml)$/.test(
      pathname
    )
  const isExcludedRoute = [
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/sitemap-0.xml',
    '/ads.txt'
  ].includes(pathname)

  if (pathname.startsWith('/_next') || isStaticFile || isExcludedRoute) {
    return NextResponse.next()
  }

  // 1. Bot Protection (Global)
  if (isBot(userAgent)) {
    return new NextResponse('Bot detected/Not allowed', { status: 403 })
  }

  // 2. API Protection (CSRF / Origin Check)
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

  // 3. Rate Limiting (Global)
  if (!checkRateLimit(ip)) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }

  const response = NextResponse.next()
  response.headers.set(
    'Cache-Control',
    'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400'
  )
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
}
