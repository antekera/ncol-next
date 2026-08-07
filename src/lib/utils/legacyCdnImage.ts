const LEGACY_CDN_HOST = 'cdn.noticiascol.com'

/**
 * Returns the original CDN URL requested through Next's image optimizer.
 *
 * Legacy CDN objects can return 403 to server-side fetches, even though the
 * browser can subsequently handle a failed direct request with SafeImage's
 * local fallback. Redirecting stale `/_next/image` URLs prevents the
 * optimizer from turning that upstream 403 into a server error.
 */
export function getLegacyCdnImageUrl(optimizerUrl: string): string | null {
  try {
    const requestedUrl = new URL(optimizerUrl).searchParams.get('url')
    if (!requestedUrl) return null

    const imageUrl = new URL(requestedUrl)
    return imageUrl.hostname === LEGACY_CDN_HOST ? imageUrl.toString() : null
  } catch {
    return null
  }
}
