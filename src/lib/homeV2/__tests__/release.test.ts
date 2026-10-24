import { getHomeV2VitalsEnvironment, isHomeV2PublicEnabled } from '../release'

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

describe('public Web Vitals provenance', () => {
  it('does not enable public RUM for the control or QA deployment', () => {
    expect(getHomeV2VitalsEnvironment({})).toBeUndefined()
    expect(
      getHomeV2VitalsEnvironment({
        VERCEL: '1',
        VERCEL_ENV: 'production',
        HOME_V2_PERFORMANCE_AUDIT: 'true'
      })
    ).toBeUndefined()
  })

  it.each(['production', 'preview'] as const)(
    'uses the server deployment environment %s only with the public flag',
    environment => {
      expect(
        getHomeV2VitalsEnvironment({
          HOME_V2_PUBLIC_ENABLED: 'true',
          VERCEL: '1',
          VERCEL_ENV: environment
        })
      ).toBe(environment)
    }
  )

  it.each([{}, { VERCEL_ENV: 'production' }, { VERCEL: '1' }])(
    'keeps local or unspecified deployments out of production field data: %j',
    environment => {
      expect(
        getHomeV2VitalsEnvironment({
          ...environment,
          HOME_V2_PUBLIC_ENABLED: 'true'
        })
      ).toBe('local')
    }
  )
})
