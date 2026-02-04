'use client'

import * as Sentry from '@sentry/nextjs'
import { useState } from 'react'

export default function SentryExamplePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const triggerClientError = () => {
    throw new Error('Sentry Test Error: Client-side error triggered manually')
  }

  const triggerSentryCapture = () => {
    setIsLoading(true)
    try {
      Sentry.captureException(
        new Error('Sentry Test: Manual captureException call')
      )
      Sentry.captureMessage('Sentry Test: Manual captureMessage call', 'info')
      setResult('✅ Events sent to Sentry! Check your Sentry dashboard.')
    } catch (err) {
      setResult(`❌ Error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const triggerApiError = async () => {
    setIsLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/sentry-example-api')
      const data = await res.json()
      if (!res.ok) {
        setResult(`❌ API Error: ${data.error || 'Unknown error'}`)
      } else {
        setResult(`✅ API Response: ${JSON.stringify(data)}`)
      }
    } catch (err) {
      setResult(
        `❌ Fetch Error: ${err instanceof Error ? err.message : String(err)}`
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='mx-auto max-w-2xl p-8'>
      <h1 className='mb-6 text-3xl font-bold'>Sentry Test Page</h1>

      <div className='mb-8 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20'>
        <p className='text-sm text-yellow-800 dark:text-yellow-200'>
          <strong>⚠️ Warning:</strong> These buttons will send real errors to
          your Sentry dashboard. Use them only for testing purposes.
        </p>
      </div>

      <div className='space-y-4'>
        <div className='rounded-lg border p-4'>
          <h2 className='mb-2 text-xl font-semibold'>
            1. Test Manual Capture (Safe)
          </h2>
          <p className='mb-3 text-sm text-neutral-600 dark:text-neutral-400'>
            Sends a test exception and message to Sentry without crashing the
            page.
          </p>
          <button
            onClick={triggerSentryCapture}
            disabled={isLoading}
            className='rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50'
          >
            {isLoading ? 'Sending...' : 'Send Test Event'}
          </button>
        </div>

        <div className='rounded-lg border p-4'>
          <h2 className='mb-2 text-xl font-semibold'>
            2. Test API Route Error
          </h2>
          <p className='mb-3 text-sm text-neutral-600 dark:text-neutral-400'>
            Triggers an error in a server-side API route.
          </p>
          <button
            onClick={() => void triggerApiError()}
            disabled={isLoading}
            className='rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 disabled:opacity-50'
          >
            {isLoading ? 'Testing...' : 'Test API Error'}
          </button>
        </div>

        <div className='rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20'>
          <h2 className='mb-2 text-xl font-semibold text-red-800 dark:text-red-200'>
            3. Test Client Error (Crashes Page)
          </h2>
          <p className='mb-3 text-sm text-red-600 dark:text-red-400'>
            Throws an unhandled error that will crash this page and trigger the
            error boundary.
          </p>
          <button
            onClick={triggerClientError}
            className='rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700'
          >
            Trigger Client Error
          </button>
        </div>
      </div>

      {result && (
        <div className='mt-6 rounded-lg border bg-neutral-100 p-4 dark:bg-neutral-800'>
          <h3 className='mb-2 font-semibold'>Result:</h3>
          <pre className='text-sm whitespace-pre-wrap'>{result}</pre>
        </div>
      )}

      <div className='mt-8 text-sm text-neutral-500'>
        <p>
          <strong>DSN configured:</strong>{' '}
          {process.env.NEXT_PUBLIC_SENTRY_DSN ? '✅ Yes' : '❌ No'}
        </p>
      </div>
    </div>
  )
}
