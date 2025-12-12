'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error)
    // eslint-disable-next-line no-console
    console.error('Client-side Error:', error)
  }, [error])

  return (
    <div className='flex min-h-[400px] flex-col items-center justify-center p-4 text-center'>
      <h2 className='mb-4 text-2xl font-bold'>¡Algo salió mal!</h2>
      <p className='mb-6 text-neutral-600 dark:text-neutral-400'>
        Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
      </p>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        className='rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
