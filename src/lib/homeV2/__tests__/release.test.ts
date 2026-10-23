import { isHomeV2PublicEnabled } from '../release'

describe('public Home V2 release selection', () => {
  it('preserves the legacy Home until explicitly enabled for the deployment', () => {
    expect(isHomeV2PublicEnabled({})).toBe(false)
    expect(isHomeV2PublicEnabled({ HOME_V2_PUBLIC_ENABLED: 'false' })).toBe(
      false
    )
    expect(isHomeV2PublicEnabled({ HOME_V2_PUBLIC_ENABLED: '1' })).toBe(false)
  })

  it('accepts the public deployment setting independently of local QA', () => {
    expect(
      isHomeV2PublicEnabled({
        HOME_V2_PUBLIC_ENABLED: 'true',
        VERCEL: '1',
        VERCEL_ENV: 'production'
      })
    ).toBe(true)
    expect(
      isHomeV2PublicEnabled({
        HOME_V2_PREVIEW_ENABLED: 'true',
        HOME_V2_PERFORMANCE_AUDIT: 'true',
        HOME_V2_PREVIEW_COMPARE_OPENINGS: 'true'
      })
    ).toBe(false)
  })
})
