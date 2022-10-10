import NextErrorComponent from 'next/error'

import * as Sentry from '@sentry/nextjs'

const ErrorPage = ({ statusCode, hasGetInitialPropsRun, err }) => {
  if (!hasGetInitialPropsRun && err) {
    Sentry.captureException(err)
  }

  return <NextErrorComponent statusCode={statusCode} />
}

ErrorPage.getInitialProps = async context => {
  const errorInitialProps = await NextErrorComponent.getInitialProps(context)

  const { res, err, asPath } = context

  errorInitialProps.hasGetInitialPropsRun = true

  if (res?.statusCode === 404) {
    return errorInitialProps
  }

  if (err) {
    Sentry.captureException(err)

    await Sentry.flush(2000)

    return errorInitialProps
  }

  Sentry.captureException(
    new Error(
      `_error.js getInitialProps missing data at path: ${asPath} --- err: ${err} --- res: ${res} --- res?.statusCode: ${res?.statusCode}`
    )
  )

  await Sentry.flush(2000)

  return errorInitialProps
}

export default ErrorPage
