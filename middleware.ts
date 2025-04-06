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

function isBot(userAgent: string): boolean {
  return BLOCKED_USER_AGENTS.some(pattern => pattern.test(userAgent))
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW

  // Limpiar entradas antiguas
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  const userAgent = request.headers.get('user-agent') || ''

  // Ignorar rutas que no deberían pasar por middleware
  const isStaticFile = pathname.match(
    /\.(ico|png|jpg|jpeg|svg|css|js|webp|ttf|woff|woff2|txt|xml)$/
  )
  const isExcludedRoute = [
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/sitemap-0.xml',
    '/ads.txt'
  ].includes(pathname)

  if (isStaticFile || isExcludedRoute) {
    return NextResponse.next()
  }

  if (isBot(userAgent)) {
    return new NextResponse('Not allowed', { status: 403 })
  }

  if (!checkRateLimit(ip)) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }

  console.log('📍 Middleware hit:', pathname)

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
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
