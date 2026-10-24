import type {
  HomeSnapshotClient,
  HomeSnapshotLease
} from '@lib/api/HomeSnapshotClient'
import { HOME_SNAPSHOT_BACKUP_MS } from './publicCachePolicy'
import type { HomeSnapshot } from './types'

type ProcessResult = {
  status: 'updated' | 'idle' | 'delivered' | 'pending' | 'superseded'
  delivery?: 'pending'
}

export class PublicHomeSnapshotService {
  constructor(
    private readonly store: HomeSnapshotClient,
    private readonly key: string,
    private readonly windowMs: number,
    private readonly load: () => Promise<HomeSnapshot>,
    private readonly invalidate: (revision: number) => Promise<boolean>,
    private readonly now: () => number = Date.now
  ) {}

  request() {
    return this.store.request(this.key, this.now(), this.windowMs)
  }

  private async deliver(lease: HomeSnapshotLease, revision: number) {
    try {
      // Retain the reservation until expiry if Next has only queued work. This
      // prevents peers from flooding the provider before its deferred flush.
      if (!(await this.invalidate(revision))) return false
      if (!(await this.store.acknowledge(lease, revision, this.now())))
        throw new Error('Home invalidation ownership expired')
      return true
    } catch (error) {
      await this.store.release(lease).catch(() => {})
      throw error
    }
  }

  private async deliverPending(revision: number, invalidated: number) {
    if (revision <= invalidated) return undefined
    const delivery = await this.store.claimDelivery(
      this.key,
      this.now(),
      crypto.randomUUID()
    )
    if (!delivery) return undefined
    return (await this.deliver(delivery, delivery.revision))
      ? 'delivered'
      : 'pending'
  }

  private needsRefresh(
    metadata: Awaited<ReturnType<HomeSnapshotClient['metadata']>>
  ) {
    if (!metadata) return true
    const pending =
      metadata.requestedRevision > metadata.appliedRevision &&
      metadata.dueAt !== null &&
      metadata.dueAt <= this.now()
    const backup =
      metadata.fetchedAt === null ||
      metadata.fetchedAt <= this.now() - HOME_SNAPSHOT_BACKUP_MS
    return pending || backup
  }

  private async deliveryResult(
    metadata: Awaited<ReturnType<HomeSnapshotClient['metadata']>>,
    deliver: boolean
  ): Promise<ProcessResult> {
    if (!metadata || !deliver) return { status: 'idle' }
    return {
      status:
        (await this.deliverPending(
          metadata.snapshotRevision,
          metadata.invalidatedRevision
        )) ?? 'idle'
    }
  }

  async process({ deliver = true } = {}): Promise<ProcessResult> {
    const metadata = await this.store.metadata(this.key)
    if (!metadata) await this.store.ensure(this.key)
    if (!this.needsRefresh(metadata))
      return this.deliveryResult(metadata, deliver)
    const lease = await this.store.claim(
      this.key,
      this.now(),
      this.windowMs,
      HOME_SNAPSHOT_BACKUP_MS,
      crypto.randomUUID()
    )
    // A limited CMS attempt must not suppress delivery of the healthy copy.
    // claimDelivery still fences active owners and targets the current revision.
    if (!lease) return this.deliveryResult(metadata, deliver)
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
    if (!deliver) {
      // A build may publish before a Next request context exists. Leave its
      // delivery pending, but do not hold the reservation through the build.
      await this.store.release(lease)
      return { status: 'updated', delivery: 'pending' }
    }
    const delivered = await this.deliver(lease, revision)
    return delivered
      ? { status: 'updated' }
      : { status: 'updated', delivery: 'pending' }
  }
}
