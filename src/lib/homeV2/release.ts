/** Global deployment selection; never depends on a reader, cookie or query. */
export function isHomeV2PublicEnabled(
  env: Record<string, string | undefined> = process.env
): boolean {
  return env.HOME_V2_PUBLIC_ENABLED === 'true'
}

// Public Home owns this tag; category/legacy purges must not discard its backup.
export const HOME_V2_PUBLIC_CACHE_TAG = 'home-v2-public'
