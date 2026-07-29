import { NextRequest, NextResponse } from 'next/server'
import { verifyTurnstileToken } from '@lib/turnstile'

// Called by the login modal before it authenticates with Supabase, so a
// script can't just check that getResponse() returned a non-empty string
// client-side and skip straight to the public Supabase auth endpoint.
export async function POST(request: NextRequest) {
  const { token } = await request.json()

  if (!token || typeof token !== 'string') {
    return NextResponse.json({ verified: false }, { status: 400 })
  }

  const verified = await verifyTurnstileToken(token)
  return NextResponse.json({ verified }, { status: verified ? 200 : 403 })
}
