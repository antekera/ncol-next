import { createHash } from 'node:crypto'
import { HOME_V2_SECTIONS } from './sections'
import { homeEditorialDay } from './editorialPolicy'

export const HOME_SNAPSHOT_BACKUP_MS = 6 * 3600000

/** Fixed daytime windows; quiet nights end at 06:00 Caracas. An editorial
 * change can shorten either period without fetching another CMS snapshot. */
export function publicHomeExpiresAt(
  now: number,
  editorialChanges: readonly number[],
  windowMs = homeSnapshotWindowMs()
) {
  const morning =
    Date.parse(`${homeEditorialDay(new Date(now))}T00:00:00-04:00`) +
    HOME_SNAPSHOT_BACKUP_MS
  const policy =
    now < morning ? morning : (Math.floor(now / windowMs) + 1) * windowMs
  return Math.min(
    policy,
    ...editorialChanges.filter(at => Number.isFinite(at) && at > now)
  )
}

/** Batch cadence and backup retention are independent. No request/user inputs. */
export function homeSnapshotWindowMs(
  env: Record<string, string | undefined> = process.env
) {
  const minutes = env.HOME_V2_CACHE_BATCH_MINUTES ?? '30'
  if (minutes !== '30' && minutes !== '60')
    throw new Error('HOME_V2_CACHE_BATCH_MINUTES must be 30 or 60')
  return Number(minutes) * 60000
}

export function publicHomeSnapshotKey(
  env: Record<string, string | undefined> = process.env
) {
  let scope: string
  if (env.VERCEL === '1' && env.VERCEL_ENV === 'production')
    scope = 'production'
  else if (env.VERCEL === '1') {
    const deployment = env.VERCEL_DEPLOYMENT_ID || env.VERCEL_URL
    if (!deployment) throw new Error('Missing preview deployment identity')
    scope = `preview:${deployment}`
  } else scope = `local:${env.HOME_V2_CACHE_NAMESPACE || 'default'}`
  const config = createHash('sha256')
    .update(JSON.stringify(HOME_V2_SECTIONS))
    .digest('hex')
    .slice(0, 16)
  return `home-v2-raw-v1:${scope}:${config}`
}

// Tags must be isolated as well as rows/keys: preview must not invalidate the
// production response even if the hosting data cache spans deployments.
export function publicHomeSnapshotTag(key: string) {
  return `home-v2-snapshot:${createHash('sha256').update(key).digest('hex').slice(0, 32)}`
}
