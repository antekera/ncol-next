import type { HomeV2Data } from './types'

export const HOME_V2_PREVIEW_PATH = '/home-v2-preview'

export function isHomeV2PreviewEnabled(
  env: Record<string, string | undefined> = process.env
): boolean {
  // QA is local and opt-in; this route never enables a deployed experiment.
  return (
    env.HOME_V2_PREVIEW_ENABLED === 'true' && !env.VERCEL && !env.VERCEL_ENV
  )
}

export function isHomeV2PreviewPath(pathname: string): boolean {
  return (
    pathname === HOME_V2_PREVIEW_PATH || pathname === `${HOME_V2_PREVIEW_PATH}/`
  )
}

export function isHomeV2PerformanceAuditEnabled(
  env: Record<string, string | undefined> = process.env
): boolean {
  return isHomeV2PreviewEnabled(env) && env.HOME_V2_PERFORMANCE_AUDIT === 'true'
}

/** Manual localhost comparison only; never assigns an experimental cohort. */
export function getHomeV2AuditDestination(
  incoming: URL,
  host: string | null,
  env: Record<string, string | undefined> = process.env
): URL | null {
  if (
    !isHomeV2PerformanceAuditEnabled(env) ||
    incoming.pathname !== '/' ||
    incoming.searchParams.get('__ncol_home_audit') !== 'v2' ||
    incoming.searchParams.has('actualizar')
  )
    return null
  const loopback = new Set(['localhost', '127.0.0.1', '[::1]'])
  try {
    const hostName = host
      ? new URL(`https://${host}`).hostname
      : incoming.hostname
    if (!loopback.has(incoming.hostname) || !loopback.has(hostName)) return null
  } catch {
    return null
  }
  const destination = new URL(incoming)
  destination.pathname = `${HOME_V2_PREVIEW_PATH}/`
  return destination
}

/** Local QA fixture: exercise the real automatic no-image branch, never mutate cache. */
export function prepareHomeV2Preview(
  data: HomeV2Data,
  env: Record<string, string | undefined> = process.env
): HomeV2Data {
  if (
    !isHomeV2PreviewEnabled(env) ||
    env.HOME_V2_PREVIEW_TREATMENT !== 'traditional' ||
    !data.featured
  )
    return data
  return { ...data, featured: { ...data.featured, featuredImage: null } }
}
