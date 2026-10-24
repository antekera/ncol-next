/** Global deployment selection; never depends on a reader, cookie or query. */
export function isHomeV2PublicEnabled(
  env: Record<string, string | undefined> = process.env
): boolean {
  return env.HOME_V2_PUBLIC_ENABLED === 'true'
}

/** Enables only the prepared cache/processor. It can prewarm while Home is off. */
export function isHomeV2DurableCacheEnabled(
  env: Record<string, string | undefined> = process.env
): boolean {
  return env.HOME_V2_DURABLE_CACHE_ENABLED === 'true'
}

/** Deployment metadata only; browser parameters never promote a QA sample. */
export function getHomeV2VitalsEnvironment(
  env: Record<string, string | undefined> = process.env
): 'production' | 'preview' | 'local' | undefined {
  if (!isHomeV2PublicEnabled(env)) return
  if (env.VERCEL === '1') {
    if (env.VERCEL_ENV === 'production') return 'production'
    if (env.VERCEL_ENV === 'preview') return 'preview'
  }
  return 'local'
}

// Public Home owns this tag; category/legacy purges must not discard its backup.
export const HOME_V2_PUBLIC_CACHE_TAG = 'home-v2-public'
