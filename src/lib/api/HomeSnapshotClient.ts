import { and, eq, gt, isNull, lt, lte, or, sql } from 'drizzle-orm'
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql'
import { tursoDb } from '@lib/db/turso'
import { homeSnapshots } from '@lib/db/tursoSchema'
import * as schema from '@lib/db/tursoSchema'
import { getTursoViews } from '@lib/turso'
import type { HomeSnapshot } from '@lib/homeV2/types'

export interface HomeSnapshotLease {
  key: string
  token: string
}

/** Deadline covers the entire foreground read, including response bodies.
 * Abort the actual transport and dispose only this dedicated client; a late
 * provider response must not reach Next's cache writer or shared clients. */
export async function readPublishedHomeSnapshot(key: string) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 1500)
  let client: ReturnType<typeof getTursoViews> | undefined
  try {
    client = getTursoViews(request =>
      fetch(request, {
        cache: 'no-store',
        signal: AbortSignal.any([request.signal, controller.signal])
      })
    )
    return await new HomeSnapshotClient(drizzle(client, { schema })).get(key)
  } finally {
    clearTimeout(timer)
    controller.abort()
    client?.close()
  }
}

const nextWindow = (now: number, windowMs: number) =>
  (Math.floor(now / windowMs) + 1) * windowMs

/** All coordination uses atomic primary writes, without holding a transaction
 * over a CMS request. Reads use a short write-mode transaction: libSQL forwards
 * it to the primary, so a lagged replica cannot become a new ISR snapshot.
 */
export class HomeSnapshotClient {
  constructor(private readonly db: LibSQLDatabase<typeof schema> = tursoDb) {}

  async get(key: string): Promise<HomeSnapshot | null> {
    const [row] = await this.db.transaction(tx =>
      tx
        .select({
          data: homeSnapshots.payload,
          fetchedAt: homeSnapshots.fetchedAt
        })
        .from(homeSnapshots)
        .where(eq(homeSnapshots.cacheKey, key))
        .limit(1)
    )
    if (!row?.data || row.fetchedAt === null) return null
    if (
      !Number.isSafeInteger(row.fetchedAt) ||
      row.fetchedAt < 0 ||
      !Array.isArray(row.data.errors) ||
      row.data.errors.length
    )
      throw new Error('Invalid published Home snapshot')
    return { data: row.data, fetchedAt: row.fetchedAt }
  }

  async metadata(key: string) {
    const [row] = await this.db.transaction(tx =>
      tx
        .select({
          requestedRevision: homeSnapshots.requestedRevision,
          appliedRevision: homeSnapshots.appliedRevision,
          snapshotRevision: homeSnapshots.snapshotRevision,
          invalidatedRevision: homeSnapshots.invalidatedRevision,
          fetchedAt: homeSnapshots.fetchedAt,
          dueAt: homeSnapshots.dueAt
        })
        .from(homeSnapshots)
        .where(eq(homeSnapshots.cacheKey, key))
        .limit(1)
    )
    return row
  }

  async ensure(key: string) {
    await this.db
      .insert(homeSnapshots)
      .values({ cacheKey: key })
      .onConflictDoNothing()
  }

  async request(key: string, now: number, windowMs: number) {
    const dueAt = nextWindow(now, windowMs)
    await this.db
      .insert(homeSnapshots)
      .values({ cacheKey: key, requestedRevision: 1, dueAt })
      .onConflictDoUpdate({
        target: homeSnapshots.cacheKey,
        set: {
          requestedRevision: sql`${homeSnapshots.requestedRevision} + 1`,
          dueAt: sql`CASE WHEN ${homeSnapshots.requestedRevision} = ${homeSnapshots.appliedRevision} THEN ${dueAt} ELSE ${homeSnapshots.dueAt} END`
        }
      })
  }

  async claim(
    key: string,
    now: number,
    windowMs: number,
    backupMs: number,
    token: string
  ): Promise<HomeSnapshotLease | undefined> {
    const [row] = await this.db
      .update(homeSnapshots)
      .set({
        leaseToken: token,
        leaseUntil: now + 120000,
        claimedRevision: sql`${homeSnapshots.requestedRevision}`,
        lastAttemptAt: now
      })
      .where(
        and(
          eq(homeSnapshots.cacheKey, key),
          lte(homeSnapshots.leaseUntil, now),
          lt(
            homeSnapshots.lastAttemptAt,
            Math.floor(now / windowMs) * windowMs
          ),
          or(
            isNull(homeSnapshots.payload),
            lte(homeSnapshots.fetchedAt, now - backupMs),
            and(
              gt(
                homeSnapshots.requestedRevision,
                homeSnapshots.appliedRevision
              ),
              lte(homeSnapshots.dueAt, now)
            )
          )
        )
      )
      .returning({ key: homeSnapshots.cacheKey })
    return row ? { key: row.key, token } : undefined
  }

  async publish(
    lease: HomeSnapshotLease,
    snapshot: HomeSnapshot,
    now: number,
    windowMs: number
  ): Promise<number | undefined> {
    if (
      snapshot.data.errors.length ||
      !Number.isSafeInteger(snapshot.fetchedAt) ||
      snapshot.fetchedAt < 0
    )
      throw new Error('Cannot publish an incomplete Home snapshot')
    const [row] = await this.db
      .update(homeSnapshots)
      .set({
        payload: snapshot.data,
        fetchedAt: snapshot.fetchedAt,
        appliedRevision: sql`${homeSnapshots.claimedRevision}`,
        snapshotRevision: sql`${homeSnapshots.snapshotRevision} + 1`,
        // A slow load may cross a boundary. Pending revisions still belong to
        // the next window after this attempt, rather than after completion.
        dueAt: sql`CASE WHEN ${homeSnapshots.requestedRevision} > ${homeSnapshots.claimedRevision} THEN (CAST(${homeSnapshots.lastAttemptAt} / ${windowMs} AS INTEGER) + 1) * ${windowMs} ELSE NULL END`
      })
      .where(
        and(
          eq(homeSnapshots.cacheKey, lease.key),
          eq(homeSnapshots.leaseToken, lease.token),
          gt(homeSnapshots.leaseUntil, now)
        )
      )
      .returning({ revision: homeSnapshots.snapshotRevision })
    return row?.revision
  }

  async release(lease: HomeSnapshotLease) {
    await this.db
      .update(homeSnapshots)
      .set({ leaseToken: null, leaseUntil: 0 })
      .where(
        and(
          eq(homeSnapshots.cacheKey, lease.key),
          eq(homeSnapshots.leaseToken, lease.token)
        )
      )
  }

  async claimDelivery(key: string, now: number, token: string) {
    const [row] = await this.db
      .update(homeSnapshots)
      .set({ leaseToken: token, leaseUntil: now + 120000 })
      .where(
        and(
          eq(homeSnapshots.cacheKey, key),
          lte(homeSnapshots.leaseUntil, now),
          gt(homeSnapshots.snapshotRevision, homeSnapshots.invalidatedRevision)
        )
      )
      .returning({ revision: homeSnapshots.snapshotRevision })
    return row ? { key, token, revision: row.revision } : undefined
  }

  async acknowledge(lease: HomeSnapshotLease, revision: number, now: number) {
    const rows = await this.db
      .update(homeSnapshots)
      .set({ invalidatedRevision: revision, leaseToken: null, leaseUntil: 0 })
      .where(
        and(
          eq(homeSnapshots.cacheKey, lease.key),
          eq(homeSnapshots.leaseToken, lease.token),
          gt(homeSnapshots.leaseUntil, now),
          lt(homeSnapshots.invalidatedRevision, revision),
          eq(homeSnapshots.snapshotRevision, revision)
        )
      )
      .returning({ key: homeSnapshots.cacheKey })
    return rows.length === 1
  }
}
