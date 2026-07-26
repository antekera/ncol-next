import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

// Plain client (no session/cookie handling) — used for public, read-only
// queries like the Mundial matches data. Lazy: constructed on first call
// rather than at module load, so importing this file (e.g. transitively
// through the login modal) doesn't throw in environments/tests without
// Supabase env vars set.
let publicClient: ReturnType<typeof createSupabaseClient> | undefined
export function getPublicSupabaseClient() {
  publicClient ??= createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  return publicClient
}

// SSR-aware browser client — reads/writes the auth session cookie, shared
// with ncol-legales via the same Supabase project. Use this for anything
// touching the logged-in user (login modal, tag subscriptions).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
