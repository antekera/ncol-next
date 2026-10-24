import { CMS_URL } from '@lib/constants'

/** Trusted deployment/configuration only; never use visitor Host headers. */
export function homeCacheOrigin(): URL | null {
  let origin = process.env.HOME_V2_CACHE_RECOVERY_ORIGIN
  if (process.env.VERCEL === '1')
    origin =
      // Standard Vercel protection can require login on VERCEL_URL even for
      // production. Recover through the trusted domain serving the active Home.
      process.env.VERCEL_ENV === 'production'
        ? CMS_URL
        : process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`
  if (!origin) return null
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
      return null
    return url
  } catch {
    return null
  }
}
