import { get as httpGet } from 'node:http'
import { get as httpsGet } from 'node:https'
import { revalidateTag } from 'next/cache'
import { homeCacheOrigin } from './homeCacheOrigin'
import { publicHomeSnapshotTag } from './publicCachePolicy'
import { isHomeV2PublicEnabled } from './release'

function htmlReceipt(body: string, marker: string) {
  for (const match of body.matchAll(/<div\b[^>]*>/g))
    if (match[0].includes(` data-home-snapshot="${marker}"`)) return true
  return false
}

function observed(
  url: URL,
  marker: string,
  flight: boolean,
  redirected = false,
  signal = AbortSignal.timeout(3000)
): Promise<boolean> {
  return new Promise(resolve => {
    // Native HTTP deliberately sends ordinary visitor requests: Next's patched
    // fetch(no-store) can bypass the cache and produce a misleading receipt.
    const request = (url.protocol === 'https:' ? httpsGet : httpGet)(
      url,
      {
        headers: flight ? { RSC: '1' } : {},
        signal
      },
      response => {
        // Next 16 canonicalizes the RSC cache key with a same-page redirect.
        // Follow that one redirect only, sharing the original time budget.
        if (flight && !redirected && response.statusCode === 307) {
          let target: URL | undefined
          try {
            if (response.headers.location)
              target = new URL(response.headers.location, url)
          } catch {
            // Invalid locations remain unconfirmed, like any failed receipt.
          }
          if (
            target &&
            target.origin === url.origin &&
            !target.username &&
            !target.password &&
            target.pathname === '/' &&
            !target.hash &&
            [...target.searchParams.keys()].join() === '_rsc' &&
            /^[a-zA-Z0-9_-]*$/.test(target.searchParams.get('_rsc') ?? '')
          ) {
            response.destroy()
            void observed(target, marker, flight, true, signal).then(resolve)
            return
          }
        }
        const type = response.headers['content-type'] ?? ''
        if (
          response.statusCode !== 200 ||
          !(flight ? /text\/x-component/ : /text\/html/).test(type)
        ) {
          response.destroy()
          resolve(false)
          return
        }
        const chunks: Buffer[] = []
        let size = 0
        response.on('data', (chunk: Buffer) => {
          size += chunk.length
          if (size > 4 * 1024 * 1024) {
            request.destroy()
            resolve(false)
          } else chunks.push(chunk)
        })
        response.on('error', () => resolve(false))
        response.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8')
          resolve(
            flight
              ? body.includes(`"data-home-snapshot":"${marker}"`)
              : htmlReceipt(body, marker)
          )
        })
      }
    )
    request.on('error', () => resolve(false))
  })
}

/** Queueing is not delivery. Confirm only a matching namespace/revision in
 * ordinary public HTML AND Flight; an unconfirmed attempt remains durable.
 * This samples one serving location, not every CDN POP or browser cache. */
export async function deliverPublicHomeSnapshot(key: string, revision: number) {
  const tag = publicHomeSnapshotTag(key)
  const origin = homeCacheOrigin()
  if (isHomeV2PublicEnabled() && origin) {
    const marker = `${tag}:${revision}`
    const receipts = await Promise.all([
      observed(origin, marker, false),
      observed(new URL('/?_rsc=home-cache-receipt', origin), marker, true)
    ])
    if (receipts.every(Boolean)) return true
  }
  revalidateTag(tag, 'max')
  return false
}
