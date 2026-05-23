import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting is intentionally omitted here — the in-memory Map doesn't
// work across Lambda instances. Use CloudFront WAF for distributed rate limiting.

const BLOCKED_USER_AGENTS = [
  /headless/i,
  /scraper/i,
  /python/i,
  /curl/i,
  /wget/i,
  /phantom/i,
  /selenium/i,
  /puppeteer/i
]

const GOOD_BOTS = [
  /googlebot/i,
  /googleother/i,
  /google-inspectiontool/i,
  /storebot-google/i,
  /google-cloudvertexbot/i,
  /google-extended/i,
  /adsbot-google/i,
  /mediapartners-google/i,
  /google-read-aloud/i,
  /apis-google/i,
  /bingbot/i,
  /yandexbot/i,
  /duckduckbot/i,
  /slurp/i,
  /baiduspider/i,
  /facebot/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /embedly/i,
  /quora link preview/i,
  /pinterest/i,
  /slackbot/i,
  /discordbot/i,
  /whatsapp/i,
  /applebot/i,
  /Playwright/i
]

function isBot(userAgent: string): boolean {
  // 1. Allow Good Bots explicitly
  if (GOOD_BOTS.some(pattern => pattern.test(userAgent))) {
    return false
  }
  // 2. Block Bad Bots
  return BLOCKED_USER_AGENTS.some(pattern => pattern.test(userAgent))
}

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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 0. Normalize URL (Fix double slashes)
  const rawUrl = request.url
  const splitUrl = rawUrl.split('?')
  const baseUrl = splitUrl[0] // ignoring query string for detection
  const noProtocol = baseUrl.replace(/^https?:\/\//, '')

  if (noProtocol.includes('//')) {
    const url = request.nextUrl.clone()
    url.pathname = url.pathname.replace(/\/+/g, '/')
    return NextResponse.redirect(url)
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    (request as any).ip ||
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
  // Allow localhost/local development (skips bot check for local IPs)
  const isLocalhost = ip === '127.0.0.1' || ip === '::1'
  if (isBot(userAgent) && !isLocalhost) {
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

  // Article pages (:section/:month/:day/:slug/) rarely change — use longer cache.
  // All other pages (homepage, categories) stay at 1h from next.config.mjs.
  const isArticlePage = /^\/[^/]+\/\d{2}\/\d{2}\/[^/]+/.test(pathname)

  const response = NextResponse.next()
  if (isArticlePage) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800'
    )
  }
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
