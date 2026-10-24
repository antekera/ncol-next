/** @jest-environment node */
import {
  homeSnapshotWindowMs,
  publicHomeSnapshotKey,
  publicHomeSnapshotTag,
  publicHomeExpiresAt
} from '../publicCachePolicy'

it('uses the preview build identity before deployment metadata exists and preserves it at runtime', async () => {
  jest.resetModules()
  jest.doMock('@lib/generated/homeCacheIdentity.json', () => ({
    environment: 'preview',
    previewBuildId: 'fixture-build'
  }))
  try {
    await jest.isolateModulesAsync(async () => {
      const policy = await import('../publicCachePolicy')
      const enabled = {
        HOME_V2_PUBLIC_ENABLED: 'true',
        HOME_V2_DURABLE_CACHE_ENABLED: 'true'
      }
      const built = policy.publicHomeSnapshotKey({
        ...enabled,
        HOME_V2_CACHE_BUILD_ENV: 'preview'
      })
      expect(built).toMatch(/^home-v2-raw-v1:preview:build:fixture-build:/)
      expect(
        policy.publicHomeSnapshotKey({
          ...enabled,
          VERCEL: '1',
          VERCEL_ENV: 'preview',
          VERCEL_DEPLOYMENT_ID: 'actual-runtime'
        })
      ).toBe(built)
      expect(() =>
        policy.publicHomeSnapshotKey({
          ...enabled,
          VERCEL: '1',
          VERCEL_ENV: 'production'
        })
      ).toThrow('target')
    })
  } finally {
    jest.dontMock('@lib/generated/homeCacheIdentity.json')
  }
})

it('binds production builds to production and rejects a preview or an unspecified local target', async () => {
  jest.resetModules()
  jest.doMock('@lib/generated/homeCacheIdentity.json', () => ({
    environment: 'production',
    previewBuildId: null
  }))
  try {
    await jest.isolateModulesAsync(async () => {
      const policy = await import('../publicCachePolicy')
      const enabled = {
        HOME_V2_PUBLIC_ENABLED: 'true',
        HOME_V2_DURABLE_CACHE_ENABLED: 'true'
      }
      const built = policy.publicHomeSnapshotKey({
        ...enabled,
        HOME_V2_CACHE_BUILD_ENV: 'production'
      })
      expect(built).toMatch(/^home-v2-raw-v1:production:/)
      expect(
        policy.publicHomeSnapshotKey({
          ...enabled,
          VERCEL: '1',
          VERCEL_ENV: 'production'
        })
      ).toBe(built)
      expect(() =>
        policy.publicHomeSnapshotKey({
          ...enabled,
          VERCEL: '1',
          VERCEL_ENV: 'preview'
        })
      ).toThrow('target')
      expect(() =>
        policy.publicHomeSnapshotKey({ ...enabled, VERCEL: '0' })
      ).toThrow('target')
    })
  } finally {
    jest.dontMock('@lib/generated/homeCacheIdentity.json')
  }
})

it.each(['00:00:00', '02:15:00', '05:59:59'])(
  'keeps a quiet Caracas night until 06:00 when rendered at %s',
  time => {
    expect(
      publicHomeExpiresAt(Date.parse(`2026-10-24T${time}-04:00`), [])
    ).toBe(Date.parse('2026-10-24T06:00:00-04:00'))
  }
)

it('uses the next fixed daytime boundary for either configured cadence', () => {
  const now = Date.parse('2026-10-24T11:05:00-04:00')
  expect(publicHomeExpiresAt(now, [], 1800000)).toBe(
    Date.parse('2026-10-24T11:30:00-04:00')
  )
  expect(publicHomeExpiresAt(now, [], 3600000)).toBe(
    Date.parse('2026-10-24T12:00:00-04:00')
  )
  expect(publicHomeExpiresAt(Date.parse('2026-10-24T06:00:00-04:00'), [])).toBe(
    Date.parse('2026-10-24T06:30:00-04:00')
  )
})

it('shortens the night for an editorial change without using past deadlines', () => {
  const now = Date.parse('2026-10-24T01:00:00-04:00')
  const manual = Date.parse('2026-10-24T02:00:00-04:00')
  expect(publicHomeExpiresAt(now, [now, now - 1000, manual])).toBe(manual)
  expect(publicHomeExpiresAt(manual, [now, manual])).toBe(
    Date.parse('2026-10-24T06:00:00-04:00')
  )
})

it('allows the proposed global windows and rejects silently misspelled configuration', () => {
  expect(homeSnapshotWindowMs({})).toBe(1800000)
  expect(homeSnapshotWindowMs({ HOME_V2_CACHE_BATCH_MINUTES: '60' })).toBe(
    3600000
  )
  expect(() =>
    homeSnapshotWindowMs({ HOME_V2_CACHE_BATCH_MINUTES: '5' })
  ).toThrow()
})

it('isolates local and preview state from the stable production key', () => {
  const production = { VERCEL: '1', VERCEL_ENV: 'production' }
  const stable = publicHomeSnapshotKey(production)
  expect(
    publicHomeSnapshotKey({ ...production, VERCEL_DEPLOYMENT_ID: 'new-build' })
  ).toBe(stable)
  expect(publicHomeSnapshotKey({ VERCEL_ENV: 'production' })).not.toBe(stable)
  const preview = {
    VERCEL: '1',
    VERCEL_ENV: 'preview',
    VERCEL_DEPLOYMENT_ID: 'a'
  }
  expect(publicHomeSnapshotKey(preview)).not.toBe(stable)
  expect(publicHomeSnapshotTag(publicHomeSnapshotKey(preview))).not.toBe(
    publicHomeSnapshotTag(stable)
  )
  expect(
    publicHomeSnapshotKey({ ...preview, VERCEL_DEPLOYMENT_ID: 'b' })
  ).not.toBe(publicHomeSnapshotKey(preview))
  expect(() =>
    publicHomeSnapshotKey({ VERCEL: '1', VERCEL_ENV: 'preview' })
  ).toThrow()
})
