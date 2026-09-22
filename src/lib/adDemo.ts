export const AD_DEMO_PARAM = 'ver-banners'
export const AD_DEMO_FOCUS_PARAM = 'focus'
export const AD_DEMO_PARENT_ORIGIN = 'https://anunciantes.noticiascol.com'

export const AD_DEMO_SLOTS = [
  'article-bottom',
  'sidebar',
  'inline',
  'article-top',
  'header',
  'sticky-bottom',
  'popup'
] as const

export type AdDemoSlot = (typeof AD_DEMO_SLOTS)[number]

type ReadonlySearchParams = Pick<URLSearchParams, 'get' | 'has'>

export function isAdDemoMode(searchParams: ReadonlySearchParams) {
  return searchParams.has(AD_DEMO_PARAM)
}

export function getAdDemoFocus(
  searchParams: ReadonlySearchParams
): AdDemoSlot | null {
  const focus = searchParams.get(AD_DEMO_FOCUS_PARAM)
  return AD_DEMO_SLOTS.find(slot => slot === focus) ?? null
}

export function isBrowserAdDemoMode() {
  return (
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has(AD_DEMO_PARAM)
  )
}

export function applyAdDemoFramingHeaders(
  headers: Headers,
  demoMode: boolean,
  production = process.env.NODE_ENV === 'production'
) {
  if (!demoMode) {
    headers.set('X-Frame-Options', 'DENY')
    return
  }

  const developmentOrigins = production
    ? ''
    : // HTTP is intentionally limited to local development iframe testing.
      // eslint-disable-next-line sonarjs/no-clear-text-protocols
      ' http://localhost:3000 http://localhost:3011'

  headers.delete('X-Frame-Options')
  headers.set(
    'Content-Security-Policy',
    `frame-ancestors ${AD_DEMO_PARENT_ORIGIN}${developmentOrigins}`
  )
  headers.set('X-Robots-Tag', 'noindex, nofollow')
}
