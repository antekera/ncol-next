/** @jest-environment node */
import { HomeSnapshotClient } from '@lib/api/HomeSnapshotClient'
import { readPublicHomeSnapshot } from '../publicSnapshot'
import { publicHomeSnapshotKey } from '../publicCachePolicy'

jest.mock('@lib/db/turso', () => ({ tursoDb: {} }))
jest.mock('@lib/turso', () => ({
  getTursoViews: jest.fn(() => ({ close: jest.fn() }))
}))
jest.mock('@lib/api', () => ({ categoriesClient: {}, postsClient: {} }))
jest.mock('next/cache', () => ({ unstable_cache: (load: unknown) => load }))
const original = process.env
const snapshot = {
  fetchedAt: 1000,
  data: { featured: null, sections: {}, regions: [], errors: [] }
}
const providerError = new Error('fixture storage failure')
const nativeFetch = global.fetch
let read: jest.SpyInstance
beforeEach(() => {
  process.env = {
    ...original,
    VERCEL: '0',
    HOME_V2_CACHE_NAMESPACE: 'recovery-fixture',
    CRON_SECRET: 'fixture-secret',
    HOME_V2_CACHE_RECOVERY_ORIGIN: 'http://127.0.0.1:3215'
  }
  read = jest
    .spyOn(HomeSnapshotClient.prototype, 'get')
    .mockRejectedValue(providerError)
  global.fetch = jest.fn(async () =>
    Response.json({ key: publicHomeSnapshotKey(), snapshot })
  )
})
afterEach(() => {
  process.env = original
  global.fetch = nativeFetch
  jest.restoreAllMocks()
})

it('does not make a recovery request when storage is healthy', async () => {
  read.mockResolvedValue(snapshot)
  expect(await readPublicHomeSnapshot()).toEqual(snapshot)
  expect(fetch).not.toHaveBeenCalled()
})

it('recovers only on a provider error with authentication, an isolated namespace and no redirects', async () => {
  expect(await readPublicHomeSnapshot()).toEqual(snapshot)
  expect(fetch).toHaveBeenCalledTimes(1)
  expect(fetch).toHaveBeenCalledWith(
    new URL('http://127.0.0.1:3215/api/home-v2/snapshot'),
    expect.objectContaining({
      headers: {
        authorization: 'Bearer fixture-secret',
        'x-ncol-home-key': publicHomeSnapshotKey()
      },
      cache: 'no-store',
      redirect: 'error',
      signal: expect.any(AbortSignal)
    })
  )
})

it('does not recurse from the recovery handler', async () => {
  await expect(readPublicHomeSnapshot(false)).rejects.toBe(providerError)
  expect(fetch).not.toHaveBeenCalled()
})

it('requires prewarm if no snapshot exists, without trying HTTP or WordPress', async () => {
  read.mockResolvedValue(null)
  await expect(readPublicHomeSnapshot()).rejects.toThrow('Prewarm')
  expect(fetch).not.toHaveBeenCalled()
})

it.each(['CRON_SECRET', 'HOME_V2_CACHE_RECOVERY_ORIGIN'])(
  'fails without %s rather than guessing a visitor origin',
  async name => {
    delete process.env[name]
    await expect(readPublicHomeSnapshot()).rejects.toBe(providerError)
    expect(fetch).not.toHaveBeenCalled()
  }
)

it.each([
  'invalid',
  'http://example.com',
  'https://user:password@example.com',
  'https://example.com/path',
  'https://example.com/?token=private',
  'https://example.com/#fragment'
])(
  'rejects invalid recovery origin %s before sending the secret',
  async origin => {
    process.env.HOME_V2_CACHE_RECOVERY_ORIGIN = origin
    await expect(readPublicHomeSnapshot()).rejects.toBe(providerError)
    expect(fetch).not.toHaveBeenCalled()
  }
)

it('pins Vercel recovery to deployment metadata instead of a configured external origin', async () => {
  process.env.VERCEL = '1'
  process.env.VERCEL_ENV = 'preview'
  process.env.VERCEL_URL = 'preview-fixture.vercel.app'
  process.env.HOME_V2_CACHE_RECOVERY_ORIGIN = 'https://other.example.com'
  expect(await readPublicHomeSnapshot()).toEqual(snapshot)
  expect(fetch).toHaveBeenCalledWith(
    new URL('https://preview-fixture.vercel.app/api/home-v2/snapshot'),
    expect.any(Object)
  )
})

it.each([
  { key: 'other-preview', snapshot },
  { key: 'current' },
  { key: 'current', snapshot: { ...snapshot, fetchedAt: -1 } },
  {
    key: 'current',
    snapshot: { ...snapshot, data: { ...snapshot.data, errors: ['partial'] } }
  }
])(
  'rejects a response with a different namespace or an invalid snapshot',
  async body => {
    jest.mocked(fetch).mockResolvedValue(
      Response.json({
        ...body,
        key: body.key === 'current' ? publicHomeSnapshotKey() : body.key
      })
    )
    await expect(readPublicHomeSnapshot()).rejects.toBe(providerError)
    expect(fetch).toHaveBeenCalledTimes(1)
  }
)

it('preserves the provider error if the bounded recovery request also fails', async () => {
  jest.mocked(fetch).mockRejectedValue(new Error('request failure'))
  await expect(readPublicHomeSnapshot()).rejects.toBe(providerError)
  expect(fetch).toHaveBeenCalledTimes(1)
})
