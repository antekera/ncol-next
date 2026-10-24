import { NextRequest, NextResponse } from 'next/server'
import { isHomeV2DurableCacheEnabled } from '@lib/homeV2/release'
import { publicHomeSnapshotKey } from '@lib/homeV2/publicCachePolicy'

export const dynamic = 'force-dynamic'

const response = (body: unknown, status: number) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

/** Server-only recovery of the existing data cache, never a CMS fallback. */
export async function GET(request: NextRequest) {
  if (!isHomeV2DurableCacheEnabled())
    return response({ error: 'not found' }, 404)
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`)
    return response({ error: 'unauthorized' }, 401)
  const key = publicHomeSnapshotKey()
  if (request.headers.get('x-ncol-home-key') !== key)
    return response({ error: 'Home namespace mismatch' }, 409)
  try {
    const { readPublicHomeSnapshot } =
      await import('@lib/homeV2/publicSnapshot')
    // If the cached copy is also missing, fail once instead of calling ourselves.
    return response({ key, snapshot: await readPublicHomeSnapshot(false) }, 200)
  } catch {
    return response({ error: 'Home snapshot unavailable' }, 503)
  }
}
