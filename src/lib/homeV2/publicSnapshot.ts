import { unstable_cache, revalidateTag } from 'next/cache'
import {
  HomeSnapshotClient,
  type HomeSnapshotLease
} from '@lib/api/HomeSnapshotClient'
import { categoriesClient, postsClient } from '@lib/api'
import { loadHomeTaxonomies, loadHomeV2Snapshot } from './loadHomeV2Data'
import { HOME_V2_SECTIONS } from './sections'
import {
  HOME_SNAPSHOT_BACKUP_MS,
  homeSnapshotWindowMs,
  publicHomeSnapshotKey,
  publicHomeSnapshotTag
} from './publicCachePolicy'
import type { HomeSnapshot } from './types'

type ProcessResult = { status: 'updated' | 'idle' | 'delivered' | 'superseded' }

export class PublicHomeSnapshotService {
  constructor(
    private readonly store: HomeSnapshotClient,
    private readonly key: string,
    private readonly windowMs: number,
    private readonly load: () => Promise<HomeSnapshot>,
    private readonly invalidate: () => void | Promise<void>,
    private readonly now: () => number = Date.now
  ) {}

  request() {
    return this.store.request(this.key, this.now(), this.windowMs)
  }

  private async deliver(lease: HomeSnapshotLease, revision: number) {
    try {
      await this.invalidate()
      // Acceptance by the adapter is not a CDN receipt. The same reservation
      // spans publication and acknowledgement so peers cannot invalidate again.
      if (!(await this.store.acknowledge(lease, revision, this.now())))
        throw new Error('Home invalidation ownership expired')
    } catch (error) {
      await this.store.release(lease).catch(() => {})
      throw error
    }
  }

  private async deliverPending(revision: number, invalidated: number) {
    if (revision <= invalidated) return false
    const delivery = await this.store.claimDelivery(
      this.key,
      this.now(),
      crypto.randomUUID()
    )
    if (!delivery) return false
    await this.deliver(delivery, delivery.revision)
    return true
  }

  async process(): Promise<ProcessResult> {
    const metadata = await this.store.metadata(this.key)
    const inactive: ProcessResult = { status: 'idle' }
    if (!metadata) await this.store.ensure(this.key)
    else {
      if (
        await this.deliverPending(
          metadata.snapshotRevision,
          metadata.invalidatedRevision
        )
      )
        inactive.status = 'delivered'
      const pending =
        metadata.requestedRevision > metadata.appliedRevision &&
        metadata.dueAt !== null &&
        metadata.dueAt <= this.now()
      const backup =
        metadata.fetchedAt === null ||
        metadata.fetchedAt <= this.now() - HOME_SNAPSHOT_BACKUP_MS
      if (!pending && !backup) return inactive
    }
    const lease = await this.store.claim(
      this.key,
      this.now(),
      this.windowMs,
      HOME_SNAPSHOT_BACKUP_MS,
      crypto.randomUUID()
    )
    if (!lease) return inactive
    let revision: number | undefined
    try {
      const snapshot = await this.load()
      revision = await this.store.publish(
        lease,
        snapshot,
        this.now(),
        this.windowMs
      )
    } catch (error) {
      // Keep the original failure; releasing a reservation can also fail when
      // storage is unavailable. Expiry permits a subsequent worker to recover.
      await this.store.release(lease).catch(() => {})
      throw error
    }
    if (revision === undefined) {
      await this.store.release(lease)
      return { status: 'superseded' }
    }
    await this.deliver(lease, revision)
    return { status: 'updated' }
  }
}

const service = () => {
  const key = publicHomeSnapshotKey()
  return new PublicHomeSnapshotService(
    new HomeSnapshotClient(),
    key,
    homeSnapshotWindowMs(),
    async () => {
      // One taxonomy load and one grouped editorial load per admitted refresh.
      // This producer is independent of Next's render cache and visitor traffic.
      const categories = await loadHomeTaxonomies(categoriesClient)
      if (!categories) throw new Error('Home taxonomies unavailable')
      const fetchedAt = Date.now()
      const data = await loadHomeV2Snapshot(
        { categories: categoriesClient, posts: postsClient },
        HOME_V2_SECTIONS,
        categories
      )
      if (data.errors.length)
        throw new Error('Home editorial snapshot incomplete')
      return { data, fetchedAt }
    },
    () => revalidateTag(publicHomeSnapshotTag(key), 'max')
  )
}

export const requestPublicHomeSnapshot = () => service().request()
export const refreshPublicHomeSnapshot = () => service().process()

// Rendering is deliberately read-only, including on a cold deployment. A
// missing copy fails the build instead of querying the CMS for each visitor.
class RecoveredHomeSnapshot extends Error {
  declare readonly snapshot: HomeSnapshot

  constructor(snapshot: HomeSnapshot) {
    super('Using the last healthy Home snapshot during a storage outage')
    // Not enumerable: cache error logging must not dump the entire payload.
    Object.defineProperty(this, 'snapshot', { value: snapshot })
  }
}

export function readPublicHomeSnapshot(recovery = true) {
  const key = publicHomeSnapshotKey()
  return unstable_cache(
    async () => {
      let snapshot: HomeSnapshot | null
      try {
        snapshot = await new HomeSnapshotClient().get(key)
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
    ['home-v2-durable-read-v1', key],
    {
      revalidate: HOME_SNAPSHOT_BACKUP_MS / 1000,
      tags: [publicHomeSnapshotTag(key)]
    }
  )().catch((error: unknown) => {
    if (error instanceof RecoveredHomeSnapshot) return error.snapshot
    throw error
  })
}

async function recoverPublishedSnapshot(key: string, originalError: unknown) {
  const origin =
    process.env.VERCEL === '1'
      ? process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`
      : process.env.HOME_V2_CACHE_RECOVERY_ORIGIN
  const secret = process.env.CRON_SECRET
  if (!origin || !secret) throw originalError
  try {
    const url = new URL(origin)
    const local =
      url.protocol === 'http:' &&
      ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)
    if (
      (!local && url.protocol !== 'https:') ||
      url.pathname !== '/' ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    )
      throw originalError
    const response = await fetch(new URL('/api/home-v2/snapshot', url), {
      headers: { authorization: `Bearer ${secret}`, 'x-ncol-home-key': key },
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(3000)
    })
    if (!response.ok) throw originalError
    const body = (await response.json()) as {
      key?: string
      snapshot?: HomeSnapshot
    }
    const snapshot = body.snapshot
    if (
      body.key !== key ||
      !snapshot ||
      !Number.isSafeInteger(snapshot.fetchedAt) ||
      snapshot.fetchedAt < 0 ||
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
