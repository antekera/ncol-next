import {
  AD_DEMO_PARENT_ORIGIN,
  applyAdDemoFramingHeaders,
  getAdDemoParentOrigin,
  getAdDemoFocus,
  isAdDemoMode
} from '@lib/adDemo'

describe('ad demo mode', () => {
  it('requires a non-empty value for the placeholder parameter', () => {
    expect(isAdDemoMode(new URLSearchParams('ver-banners'))).toBe(false)
    expect(isAdDemoMode(new URLSearchParams('ver-banners=1'))).toBe(true)
    expect(isAdDemoMode(new URLSearchParams('ver-banners=0'))).toBe(true)
    expect(isAdDemoMode(new URLSearchParams())).toBe(false)
  })

  it('accepts only real commercial slot ids as focus targets', () => {
    expect(getAdDemoFocus(new URLSearchParams('focus=sticky-bottom'))).toBe(
      'sticky-bottom'
    )
    expect(getAdDemoFocus(new URLSearchParams('focus=footer'))).toBeNull()
    expect(
      getAdDemoFocus(new URLSearchParams('focus=%22%3E%3Cscript%3E'))
    ).toBeNull()
  })

  it('keeps regular pages protected from framing', () => {
    const headers = new Headers()
    applyAdDemoFramingHeaders(headers, false, true)

    expect(headers.get('X-Frame-Options')).toBe('DENY')
    expect(headers.get('Content-Security-Policy')).toBeNull()
    expect(headers.get('X-Robots-Tag')).toBeNull()
  })

  it('allows only the commercial origin for production demo pages', () => {
    const headers = new Headers({ 'X-Frame-Options': 'DENY' })
    applyAdDemoFramingHeaders(headers, true, true)

    expect(headers.get('X-Frame-Options')).toBeNull()
    expect(headers.get('Content-Security-Policy')).toBe(
      `frame-ancestors ${AD_DEMO_PARENT_ORIGIN}`
    )
    expect(headers.get('X-Robots-Tag')).toBe('noindex, nofollow')
  })

  it('accepts only configured parents for demo close messages', () => {
    expect(getAdDemoParentOrigin('http://localhost:3011/landing', false)).toBe(
      'http://localhost:3011'
    )
    expect(getAdDemoParentOrigin('https://attacker.example', false)).toBe(
      AD_DEMO_PARENT_ORIGIN
    )
    expect(getAdDemoParentOrigin('http://localhost:3011/landing', true)).toBe(
      AD_DEMO_PARENT_ORIGIN
    )
  })
})
