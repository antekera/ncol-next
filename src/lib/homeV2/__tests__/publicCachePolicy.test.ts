/** @jest-environment node */
import {
  homeSnapshotWindowMs,
  publicHomeSnapshotKey,
  publicHomeSnapshotTag
} from '../publicCachePolicy'

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
