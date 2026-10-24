/** @jest-environment node */
import { createClient, type Client } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { readFileSync } from 'node:fs'
import { HomeSnapshotClient } from '@lib/api/HomeSnapshotClient'
import * as schema from '@lib/db/tursoSchema'
import { PublicHomeSnapshotService } from '../publicSnapshot'

jest.mock('@lib/db/turso', () => ({ tursoDb: {} }))
jest.mock('@lib/api', () => ({ categoriesClient: {}, postsClient: {} }))
jest.mock('next/cache', () => ({
  unstable_cache: (load: unknown) => load,
  revalidateTag: jest.fn()
}))
const start = Date.parse('2026-10-23T14:00:00Z')
const windowMs = 1800000
let now: number
let client: Client
let store: HomeSnapshotClient
let load: jest.Mock
let invalidate: jest.Mock
let service: PublicHomeSnapshotService
beforeEach(async () => {
  jest.useRealTimers()
  now = start
  client = createClient({ url: ':memory:' })
  await client.executeMultiple(
    readFileSync('scripts/migrations/2026-10-23-home-v2-cache.sql', 'utf8')
  )
  store = new HomeSnapshotClient(drizzle(client, { schema }))
  load = jest.fn(async () => ({
    fetchedAt: now,
    data: { featured: null, sections: {}, regions: [], errors: [] }
  }))
  invalidate = jest.fn()
  service = new PublicHomeSnapshotService(
    store,
    'home',
    windowMs,
    load,
    invalidate,
    () => now
  )
})
afterEach(() => client.close())

it('bootstraps in the processor, groups publications, and keeps readers out of the CMS', async () => {
  expect(await store.get('home')).toBeNull()
  expect(await service.process()).toEqual({ status: 'updated' })
  expect(load).toHaveBeenCalledTimes(1)
  for (let i = 0; i < 10; i++) {
    now += 1000
    await service.request()
  }
  expect(await service.process()).toEqual({ status: 'idle' })
  expect(load).toHaveBeenCalledTimes(1)
  now = start + windowMs
  expect(await service.process()).toEqual({ status: 'updated' })
  for (let i = 0; i < 20; i++) expect(await store.get('home')).not.toBeNull()
  expect(load).toHaveBeenCalledTimes(2)
  expect(invalidate).toHaveBeenCalledTimes(2)
})

it('does not lose a publication that arrives during a refresh', async () => {
  await service.process()
  await service.request()
  now = start + windowMs
  load.mockImplementationOnce(async () => {
    now += 1000
    await service.request()
    return {
      fetchedAt: now,
      data: { featured: null, sections: {}, regions: [], errors: [] }
    }
  })
  await service.process()
  expect(await store.metadata('home')).toMatchObject({
    requestedRevision: 2,
    appliedRevision: 1,
    dueAt: start + 2 * windowMs
  })
  expect(await service.process()).toEqual({ status: 'idle' })
  now = start + 2 * windowMs
  expect(await service.process()).toEqual({ status: 'updated' })
  expect(load).toHaveBeenCalledTimes(3)
})

it('keeps the next fixed boundary for a publication received while a refresh crosses that boundary', async () => {
  await service.process()
  now += 1000
  await service.request()
  const boundary = start + 2 * windowMs
  now = boundary - 10000
  load.mockImplementationOnce(async () => {
    now = boundary - 5000
    await service.request()
    now = boundary + 5000
    return {
      fetchedAt: now,
      data: { featured: null, sections: {}, regions: [], errors: [] }
    }
  })
  expect(await service.process()).toEqual({ status: 'updated' })
  expect(await store.metadata('home')).toMatchObject({
    requestedRevision: 2,
    appliedRevision: 1,
    dueAt: boundary
  })
  now = boundary + 10000
  expect(await service.process()).toEqual({ status: 'updated' })
  expect(load).toHaveBeenCalledTimes(3)
})

it('retries pending invalidation without another CMS load after a post-commit failure', async () => {
  invalidate.mockRejectedValueOnce(new Error('invalidation unavailable'))
  await expect(service.process()).rejects.toThrow('invalidation unavailable')
  expect(await store.get('home')).not.toBeNull()
  expect(await store.metadata('home')).toMatchObject({
    snapshotRevision: 1,
    invalidatedRevision: 0
  })
  expect(await service.process()).toEqual({ status: 'delivered' })
  expect(load).toHaveBeenCalledTimes(1)
  expect(await store.metadata('home')).toMatchObject({ invalidatedRevision: 1 })
})

it('retains the last healthy snapshot on failure and retries only at the next window', async () => {
  await service.process()
  const previous = await store.get('home')
  await service.request()
  now = start + windowMs
  load.mockRejectedValueOnce(new Error('CMS unavailable'))
  await expect(service.process()).rejects.toThrow('CMS unavailable')
  expect(await store.get('home')).toEqual(previous)
  expect(await service.process()).toEqual({ status: 'idle' })
  expect(load).toHaveBeenCalledTimes(2)
  now += windowMs
  expect(await service.process()).toEqual({ status: 'updated' })
  expect(load).toHaveBeenCalledTimes(3)
})

it('keeps a single invalidation owner while other processors see committed data before acknowledgement', async () => {
  await service.process()
  await service.request()
  now = start + windowMs
  let release!: () => void
  let entered!: () => void
  const waiting = new Promise<void>(resolve => {
    entered = resolve
  })
  invalidate.mockImplementationOnce(
    () =>
      new Promise<void>(resolve => {
        release = resolve
        entered()
      })
  )
  const owner = service.process()
  await waiting
  try {
    const duplicates = []
    for (let i = 0; i < 20; i++) duplicates.push(await service.process())
    expect(duplicates.every(result => result.status === 'idle')).toBe(true)
    expect(invalidate).toHaveBeenCalledTimes(2)
    expect(load).toHaveBeenCalledTimes(2)
  } finally {
    release()
    await owner
  }
})
