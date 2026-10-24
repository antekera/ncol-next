import { drizzle } from 'drizzle-orm/libsql'
import { setTimeout as delay } from 'node:timers/promises'
import { HomeSnapshotClient } from '@lib/api/HomeSnapshotClient'
import * as schema from '@lib/db/tursoSchema'
import { getTursoViews } from '@lib/turso'
import { PublicHomeSnapshotService } from './PublicHomeSnapshotService'
import { loadPublicHomeSnapshot } from './loadPublicHomeSnapshot'
import {
  HOME_SNAPSHOT_BACKUP_MS,
  homeSnapshotWindowMs,
  publicHomeSnapshotKey
} from './publicCachePolicy'

/** Build worker only. The CLI owns its deadline and terminates all transports
 * on timeout; no visitor or Next request invokes this producer. */
export async function prewarmPublicHomeSnapshot() {
  const key = publicHomeSnapshotKey()
  // Own this transport so closing a completed build worker never closes the
  // application's shared client. No parallel cache/provider is introduced.
  const client = getTursoViews(request => fetch(request, { cache: 'no-store' }))
  const store = new HomeSnapshotClient(drizzle(client, { schema }))
  const service = new PublicHomeSnapshotService(
    store,
    key,
    homeSnapshotWindowMs(),
    loadPublicHomeSnapshot,
    () => Promise.resolve(false)
  )
  let attempted = false
  let updated = false
  let waitMs = 200
  try {
    for (;;) {
      const snapshot = await store.get(key)
      if (snapshot && snapshot.fetchedAt > Date.now() - HOME_SNAPSHOT_BACKUP_MS)
        return {
          status: updated ? 'updated' : 'reused',
          scope: key.split(':')[1]
        }
      if (!attempted) {
        attempted = true
        const result = await service.process({ deliver: false })
        updated = result.status === 'updated'
        continue
      }
      // Another worker owns the fill. Reuse its result, with bounded backoff
      // instead of polling per visitor or issuing a second editorial query.
      await delay(waitMs)
      waitMs = Math.min(waitMs * 2, 4000)
    }
  } finally {
    client.close()
  }
}
