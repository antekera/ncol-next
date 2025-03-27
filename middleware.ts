import { NextResponse } from 'next/server'

export function middleware() {
  const response = NextResponse.next()

  // Add cache control headers
  response.headers.set(
    'Cache-Control',
    'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400'
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}
