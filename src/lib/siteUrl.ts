import { CMS_URL } from './constants'

// Machine endpoints and assets keep their paths; only document URLs gain /.
export function canonicalPath(pathname: string): string {
  let path = pathname
  while (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1)
  if (
    /^\/(?:api|_next|\.well-known|feed|feeds|articles-sitemap)(?:\/|$)/.test(
      path
    ) ||
    path.slice(path.lastIndexOf('/') + 1).includes('.')
  ) {
    return path
  }
  return path === '/' ? path : `${path}/`
}

// WordPress may return absolute admin/apex links or paths without a final /.
export function siteUrl(value = '/'): string {
  const url = new URL(value, `${CMS_URL}/`)
  return `${CMS_URL}${canonicalPath(url.pathname)}${url.search}${url.hash}`
}
