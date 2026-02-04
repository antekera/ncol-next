import * as Sentry from '@sentry/nextjs'

/**
 * This function is used to register Sentry for server and edge runtimes.
 * It must be called in order for Sentry to capture server-side errors.
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}

/**
 * Captures request errors and sends them to Sentry.
 * This is the exported handler for Next.js onRequestError hook.
 */
export const onRequestError = Sentry.captureRequestError
