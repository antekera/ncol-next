import { cacheLife } from 'next/cache'

/** Used only by the public durable Home. Including the render's timestamp in
 * the cache key prevents an older duration from extending an absolute expiry. */
// eslint-disable-next-line @typescript-eslint/require-await -- Next's use cache compiler requires async, while cacheLife is synchronous.
export async function cachePublicHomeUntil(
  expiresAt: number,
  renderedAt: number
) {
  'use cache'
  const seconds = Math.max(
    1,
    Math.floor((expiresAt - Math.max(renderedAt, Date.now())) / 1000)
  )
  cacheLife({ stale: 0, revalidate: seconds, expire: seconds })
  return null
}
