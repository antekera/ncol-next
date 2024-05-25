import NextErrorComponent from 'next/error'

import * as Sentry from '@sentry/nextjs'
import React from 'react' // Import the React library
const ErrorPage = ({ statusCode, hasGetInitialPropsRun, err }) => {
  if (!hasGetInitialPropsRun && err) {
    Sentry.captureUnderscoreErrorException(err)
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
    Sentry.captureUnderscoreErrorException(err)

    await Sentry.flush(2000)

    return errorInitialProps
  }

  Sentry.captureUnderscoreErrorException(
    new Error(
      `_error.js getInitialProps missing data at path: ${asPath} --- context: ${JSON.stringify(
        context
      )} --- res: ${JSON.stringify(res)} --- res?.statusCode: ${
        res?.statusCode
      }`
    )
  )

  await Sentry.flush(2000)

  return errorInitialProps
}

export default ErrorPage
