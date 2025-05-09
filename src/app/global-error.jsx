'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import Error from 'next/error'

export default function GlobalError({ error }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang='es'>
      <body>
        <Error
          statusCode={error?.statusCode}
          title={error?.message || 'Something went wrong'}
        />
      </body>
    </html>
  )
}
