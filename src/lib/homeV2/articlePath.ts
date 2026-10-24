import { CMS_URL } from '@lib/constants'
import { canonicalPath } from '@lib/siteUrl'

/** Only public dated article paths, with all query/hash/credentials discarded. */
export function articlePath(value: string): string | null {
  try {
    const url = new URL(value, CMS_URL)
    if (
      !['www.noticiascol.com', 'noticiascol.com'].includes(url.hostname) ||
      !['https:', 'http:'].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return null
    // The [posts]/[month]/[day]/[slug] route also serves legacy category URLs.
    if (
      !/^\/(?:\d{4}|[a-z][a-z0-9-]{0,79})\/(?:0[1-9]|1[0-2])\/(?:0[1-9]|[12]\d|3[01])\/[^/]+\/?$/.test(
        url.pathname
      )
    )
      return null
    return canonicalPath(url.pathname)
  } catch {
    return null
  }
}
