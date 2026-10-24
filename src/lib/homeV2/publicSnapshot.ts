import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import {
  HomeSnapshotClient,
  readPublishedHomeSnapshot
} from '@lib/api/HomeSnapshotClient'
import {
  HOME_SNAPSHOT_BACKUP_MS,
  homeSnapshotWindowMs,
  publicHomeSnapshotKey,
  publicHomeSnapshotTag
} from './publicCachePolicy'
import type { PublishedHomeSnapshot } from './types'
import { PublicHomeSnapshotService } from './PublicHomeSnapshotService'
import { loadPublicHomeSnapshot } from './loadPublicHomeSnapshot'
import { homeCacheOrigin } from './homeCacheOrigin'
import { deliverPublicHomeSnapshot } from './publicSnapshotDelivery'

const service = () => {
  const key = publicHomeSnapshotKey()
  return new PublicHomeSnapshotService(
    new HomeSnapshotClient(),
    key,
    homeSnapshotWindowMs(),
    loadPublicHomeSnapshot,
    revision => deliverPublicHomeSnapshot(key, revision)
  )
}

export const requestPublicHomeSnapshot = () => service().request()
export const refreshPublicHomeSnapshot = () => service().process()

// Rendering is deliberately read-only, including on a cold deployment. A
// missing copy fails the build instead of querying the CMS for each visitor.
class RecoveredHomeSnapshot extends Error {
  declare readonly snapshot: PublishedHomeSnapshot

  constructor(snapshot: PublishedHomeSnapshot) {
    super('Using the last healthy Home snapshot during a storage outage')
    // Not enumerable: cache error logging must not dump the entire payload.
    Object.defineProperty(this, 'snapshot', { value: snapshot })
  }
}

export function readPublicHomeSnapshot(recovery = true) {
  const key = publicHomeSnapshotKey()
  return unstable_cache(
    async () => {
      let snapshot: PublishedHomeSnapshot | null
      try {
        snapshot = await readPublishedHomeSnapshot(key)
      } catch (error) {
        // Hard-expired HTML skips unstable_cache reads. A normal authenticated
        // request can still read this same healthy entry. Recovery changes only
        // error handling, so both callers deliberately share the cache key.
        if (!recovery) throw error
        // Return the recovered value outside the cache writer. Resolving it
        // here would republish an old copy with a fresh cache timestamp.
        throw new RecoveredHomeSnapshot(
          await recoverPublishedSnapshot(key, error)
        )
      }
      if (!snapshot)
        throw new Error(
          'Prewarm the published Home snapshot before enabling Home V2'
        )
      return snapshot
    },
    ['home-v2-durable-read-v2', key],
    {
      revalidate: HOME_SNAPSHOT_BACKUP_MS / 1000,
      tags: [publicHomeSnapshotTag(key)]
    }
  )().catch((error: unknown) => {
    if (error instanceof RecoveredHomeSnapshot) return error.snapshot
    throw error
  })
}

// Both editorial data and the public receipt share one read per render.
export const getPublicHomeSnapshot = cache(() => readPublicHomeSnapshot())

async function recoverPublishedSnapshot(key: string, originalError: unknown) {
  const origin = homeCacheOrigin()
  const secret = process.env.CRON_SECRET
  if (!origin || !secret) throw originalError
  try {
    const response = await fetch(new URL('/api/home-v2/snapshot', origin), {
      headers: { authorization: `Bearer ${secret}`, 'x-ncol-home-key': key },
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(3000)
    })
    if (!response.ok) throw originalError
    const body = (await response.json()) as {
      key?: string
      snapshot?: PublishedHomeSnapshot
    }
    const snapshot = body.snapshot
    if (
      body.key !== key ||
      !snapshot ||
      !Number.isSafeInteger(snapshot.fetchedAt) ||
      snapshot.fetchedAt < 0 ||
      !Number.isSafeInteger(snapshot.revision) ||
      snapshot.revision < 1 ||
      !Array.isArray(snapshot.data?.errors) ||
      snapshot.data.errors.length
    )
      throw originalError
    return snapshot
  } catch {
    // Do not replace the provider error with URLs or request headers/tokens.
    throw originalError
  }
}
