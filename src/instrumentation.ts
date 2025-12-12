import * as Sentry from '@sentry/nextjs'

export const onRequestError = (err: any, request: any, context: any) => {
  Sentry.captureRequestError(err, request, context)

  // eslint-disable-next-line no-console
  console.error('Detailed Server Error:', {
    message: err?.message || 'Unknown error',
    stack: err?.stack,
    url: request?.url,
    method: request?.method,
    context
  })
}
