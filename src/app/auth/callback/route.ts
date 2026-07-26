import { NextResponse } from 'next/server'
import { createClient } from '@lib/supabase/server'

// Mirrors ncol-legales/src/app/auth/callback/route.ts so a login started
// from ncol-next (same Supabase project) completes on the same domain.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'

  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'
  const redirectOrigin =
    !isLocalEnv && forwardedHost ? `https://${forwardedHost}` : origin

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })

    if (!error) {
      return NextResponse.redirect(`${redirectOrigin}${next}?verified=true`)
    }
    return NextResponse.redirect(
      `${redirectOrigin}/auth/auth-code-error?description=${encodeURIComponent(error.message)}`
    )
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${redirectOrigin}${next}?verified=true`)
    }
    return NextResponse.redirect(
      `${redirectOrigin}/auth/auth-code-error?description=${encodeURIComponent(error.message)}`
    )
  }

  return NextResponse.redirect(`${redirectOrigin}/auth/auth-code-error`)
}
