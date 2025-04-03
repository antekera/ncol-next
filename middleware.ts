import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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

  // Log de rutas para CloudWatch
  console.log('📍 Middleware hit:', pathname)

  // Respuesta con headers de caché personalizados
  const response = NextResponse.next()
  response.headers.set(
    'Cache-Control',
    'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400'
  )

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
