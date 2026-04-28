import { NextRequest } from 'next/server'

interface TrackItem {
  ad_id: string
  slot: string
  date: string
  views: number
  clicks: number
  device?: string
}

interface TrackBody {
  ads: TrackItem[]
}

function safeCount(n: number, max: number) {
  return Math.min(Math.max(0, Number.isFinite(n) ? Math.floor(n) : 0), max)
}

function itemToEvents(
  item: TrackItem,
  timestamp: string,
  max: number,
  meta: Record<string, string>
): Record<string, unknown>[] {
  const { ad_id, slot, date, views, clicks, device } = item
  if (!ad_id || !slot || !date) return []
  const out: Record<string, unknown>[] = []
  const base = {
    ad_id,
    slot,
    date,
    occurred_at: timestamp,
    ...meta,
    device: device || 'unknown'
  }
  for (let i = 0; i < safeCount(views, max); i++)
    out.push({ ...base, event_type: 'view' })
  for (let i = 0; i < safeCount(clicks, max); i++)
    out.push({ ...base, event_type: 'click' })
  return out
}

export async function POST(req: NextRequest) {
  let body: TrackBody
  try {
    body = (await req.json()) as TrackBody
  } catch {
    return Response.json({ error: 'invalid json' }, { status: 400 })
  }

  if (!Array.isArray(body?.ads) || body.ads.length === 0) {
    return Response.json({ error: 'ads array required' }, { status: 400 })
  }

  const userAgent = req.headers.get('user-agent') || 'unknown'
  const referer = req.headers.get('referer') || 'unknown'
  const country = req.headers.get('x-vercel-ip-country') || 'unknown'
  const meta = { user_agent: userAgent, referer, country }

  const MAX_EVENTS = 500
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19)
  const events = body.ads.flatMap(item =>
    itemToEvents(item, timestamp, MAX_EVENTS, meta)
  )

  if (events.length === 0) {
    return Response.json({ ok: true })
  }

  const token = process.env.TINYBIRD_TOKEN || ''
  const baseUrl =
    process.env.TINYBIRD_URL || 'https://api.us-east.aws.tinybird.co'
  const ndjson = events.map(e => JSON.stringify(e)).join('\n')

  try {
    const res = await fetch(
      `${baseUrl}/v0/events?name=ad_events&token=${encodeURIComponent(token)}`,
      { method: 'POST', body: ndjson }
    )
    if (!res.ok) {
      const errorText = await res.text()
      // eslint-disable-next-line no-console
      console.error('Tinybird append failed:', res.status, errorText)
      return Response.json(
        { error: 'analytics error', detail: errorText },
        { status: 500 }
      )
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Tinybird append error:', err)
    return Response.json({ error: 'analytics error' }, { status: 500 })
  }

  return Response.json({ ok: true })
}

export async function GET() {
  return Response.json({ ok: true, message: 'Tracking endpoint' })
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  })
}
