import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Simulate an error for testing
    throw new Error('Sentry Test Error: Server-side API route error')
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json(
      { error: 'Test error captured and sent to Sentry' },
      { status: 500 }
    )
  }
}
