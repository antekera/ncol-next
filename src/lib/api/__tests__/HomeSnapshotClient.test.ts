/** @jest-environment node */
import { createClient, type Client } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { readFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { HomeSnapshotClient } from '../HomeSnapshotClient'
import * as schema from '@lib/db/tursoSchema'

jest.mock('@lib/db/turso', () => ({ tursoDb: {} }))

const windowMs = 30 * 60 * 1000
const start = Date.parse('2026-10-23T14:00:00Z')
const snapshot = (fetchedAt = start) => ({
  fetchedAt,
  data: { featured: null, sections: {}, regions: [], errors: [] }
})
let clients: Client[]
let stores: HomeSnapshotClient[]
let directory: string
beforeEach(async () => {
  jest.useRealTimers()
  directory = mkdtempSync(join(tmpdir(), 'ncol-home-store-'))
  clients = Array.from({ length: 3 }, () =>
    createClient({ url: `file:${join(directory, 'state.db')}` })
  )
  await clients[0].executeMultiple(
    readFileSync('scripts/migrations/2026-10-23-home-v2-cache.sql', 'utf8')
  )
  stores = clients.map(
    client => new HomeSnapshotClient(drizzle(client, { schema }))
  )
})
afterEach(() => {
  for (const client of clients ?? []) client.close()
  if (directory) rmSync(directory, { recursive: true, force: true })
})

it('pins ten publications to one window and admits one of twenty concurrent workers', async () => {
  await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      stores[i % 3].request('home', start + i * 1000, windowMs)
    )
  )
  const due = start + windowMs
  expect(await stores[0].metadata('home')).toMatchObject({
    requestedRevision: 10,
    dueAt: due
  })
  const claims = await Promise.all(
    Array.from({ length: 20 }, (_, i) =>
      stores[i % 3].claim('home', due, windowMs, 6 * 3600000, `worker-${i}`)
    )
  )
  const winners = claims.filter(Boolean)
  expect(winners).toHaveLength(1)
  const lease = winners[0]!
  await stores[1].request('home', due + 1000, windowMs)
  expect(
    await stores[0].publish(lease, snapshot(due), due + 2000, windowMs)
  ).toBe(1)
  expect(await stores[0].metadata('home')).toMatchObject({
    requestedRevision: 11,
    appliedRevision: 10,
    dueAt: due + windowMs,
    snapshotRevision: 1,
    invalidatedRevision: 0
  })
  expect(
    await stores[2].claim('home', due + 3000, windowMs, 21600000, 'early')
  ).toBeUndefined()
})

it('rejects an expired worker and preserves a healthy snapshot and pending invalidation across independent connections', async () => {
  await stores[0].ensure('home')
  const seed = (await stores[0].claim(
    'home',
    start,
    windowMs,
    21600000,
    'seed'
  ))!
  await stores[0].publish(seed, snapshot(), start + 1, windowMs)
  await stores[0].request('home', start + 1000, windowMs)
  const due = start + windowMs
  const old = (await stores[0].claim('home', due, windowMs, 21600000, 'old'))!
  expect(
    await stores[0].publish(old, snapshot(due), due + 120000, windowMs)
  ).toBeUndefined()
  const replacement = (await stores[1].claim(
    'home',
    due + windowMs,
    windowMs,
    21600000,
    'new'
  ))!
  expect(
    await stores[0].publish(old, snapshot(due), due + windowMs, windowMs)
  ).toBeUndefined()
  expect(
    await stores[1].publish(
      replacement,
      snapshot(due + windowMs),
      due + windowMs + 1,
      windowMs
    )
  ).toBe(2)
  await stores[0].request('home', due + windowMs + 1000, windowMs)
  const freshClient = createClient({
    url: `file:${join(directory, 'state.db')}`
  })
  clients.push(freshClient)
  const reader = new HomeSnapshotClient(drizzle(freshClient, { schema }))
  expect(await reader.get('home')).toEqual({
    ...snapshot(due + windowMs),
    revision: 2
  })
  expect(await reader.metadata('home')).toMatchObject({
    requestedRevision: 2,
    appliedRevision: 1,
    snapshotRevision: 2,
    invalidatedRevision: 0
  })
  expect(await reader.acknowledge(replacement, 1, due + windowMs + 2000)).toBe(
    false
  )
  expect(
    await reader.acknowledge(replacement, 999, due + windowMs + 2000)
  ).toBe(false)
  expect(await reader.acknowledge(replacement, 2, due + windowMs + 2000)).toBe(
    true
  )
  expect(await reader.metadata('home')).toMatchObject({
    invalidatedRevision: 2
  })
})

it('never replaces a healthy copy with a partial CMS response and bounds attempts in one window', async () => {
  await stores[0].ensure('home')
  const lease = (await stores[0].claim(
    'home',
    start,
    windowMs,
    21600000,
    'seed'
  ))!
  await stores[0].publish(lease, snapshot(), start + 1, windowMs)
  const later = start + windowMs
  await stores[0].request('home', start + 1000, windowMs)
  const bad = (await stores[0].claim('home', later, windowMs, 21600000, 'bad'))!
  await expect(
    stores[0].publish(
      bad,
      {
        ...snapshot(later),
        data: { ...snapshot().data, errors: ['opening'] }
      },
      later + 1,
      windowMs
    )
  ).rejects.toThrow()
  await stores[0].release(bad)
  expect(await stores[0].get('home')).toEqual({ ...snapshot(), revision: 1 })
  expect(
    await stores[0].claim('home', later + 1000, windowMs, 21600000, 'retry')
  ).toBeUndefined()
  expect(
    await stores[0].claim('home', later + windowMs, windowMs, 21600000, 'retry')
  ).toBeDefined()
})

it('does not refresh a quiet night before the six-hour backup and isolates deployment keys', async () => {
  await stores[0].ensure('home')
  const lease = (await stores[0].claim(
    'home',
    start,
    windowMs,
    21600000,
    'seed'
  ))!
  await stores[0].publish(lease, snapshot(), start + 1, windowMs)
  await stores[0].acknowledge(lease, 1, start + 2)
  for (let slot = 1; slot < 12; slot++)
    expect(
      await stores[0].claim(
        'home',
        start + slot * windowMs,
        windowMs,
        21600000,
        `night-${slot}`
      )
    ).toBeUndefined()
  expect(
    await stores[0].claim(
      'home',
      start + 21600000,
      windowMs,
      21600000,
      'backup'
    )
  ).toBeDefined()
  expect(await stores[0].get('preview')).toBeNull()
})
