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
