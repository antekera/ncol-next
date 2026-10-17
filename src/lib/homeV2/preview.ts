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
