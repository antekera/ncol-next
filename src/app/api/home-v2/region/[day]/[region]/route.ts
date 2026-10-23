import { NextResponse } from 'next/server'
import { getHomeV2RegionData } from '@lib/homeV2/getHomeV2RegionData'
import { homeEditorialDay } from '@lib/homeV2/editorialPolicy'
import { isHomeV2PublicEnabled } from '@lib/homeV2/release'
import { HOME_V2_REVALIDATE_SECONDS } from '@lib/homeV2/sections'

export const dynamic = 'force-dynamic'
const noStore = { 'Cache-Control': 'no-store', 'CDN-Cache-Control': 'no-store' }
const failure = (status: number) =>
  NextResponse.json({ ok: false, articles: [] }, { status, headers: noStore })

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ day: string; region: string }> }
) {
  if (!isHomeV2PublicEnabled()) return failure(404)
  const { day, region } = await params
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(day) ||
    !region ||
    region.length > 80 ||
    /[/\\\u0000-\u001f]/.test(region)
  )
    return failure(400)
  if (day !== homeEditorialDay()) return failure(410)
  try {
    const result = await getHomeV2RegionData(region)
    const now = Date.now()
    if (day !== homeEditorialDay(new Date(now))) return failure(410)
    if (
      !result.ok ||
      typeof result.fetchedAt !== 'number' ||
      !Number.isFinite(result.fetchedAt)
    )
      return failure(503)
    const validUntil = Date.parse(`${day}T00:00:00-04:00`) + 86400000
    const cacheUntil = Math.min(
      result.fetchedAt + HOME_V2_REVALIDATE_SECONDS * 1000,
      now + HOME_V2_REVALIDATE_SECONDS * 1000,
      validUntil
    )
    const ttl = Math.floor((cacheUntil - now) / 1000)
    return NextResponse.json(
      {
        ok: true,
        articles: result.articles,
        editorialDay: day,
        validUntil,
        cacheUntil
      },
      {
        headers:
          ttl > 0
            ? {
                'Cache-Control': 'public, max-age=0, must-revalidate',
                'CDN-Cache-Control': `public, s-maxage=${ttl}, stale-while-revalidate=0`
              }
            : noStore
      }
    )
  } catch {
    return failure(503)
  }
}
