import { NextRequest } from 'next/server'

interface TrackBody {
  ad_id: string
  slot: string
  date: string
  views: number
  clicks: number
}

export async function POST(req: NextRequest) {
  let body: TrackBody
  try {
    body = (await req.json()) as TrackBody
  } catch {
    return Response.json({ error: 'invalid json' }, { status: 400 })
  }

  const { ad_id, slot, date, views, clicks } = body
  if (!ad_id || !slot || !date) {
    return Response.json(
      { error: 'ad_id, slot, date required' },
      { status: 400 }
    )
  }

  const MAX_EVENTS = 100
  const safeViews = Math.min(
    Math.max(0, Number.isFinite(views) ? Math.floor(views) : 0),
    MAX_EVENTS
  )
  const safeClicks = Math.min(
    Math.max(0, Number.isFinite(clicks) ? Math.floor(clicks) : 0),
    MAX_EVENTS
  )

  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19)
  const events: Record<string, unknown>[] = []

  for (let i = 0; i < safeViews; i++) {
    events.push({
      ad_id,
      event_type: 'view',
      slot,
      date,
      occurred_at: timestamp
    })
  }
  for (let i = 0; i < safeClicks; i++) {
    events.push({
      ad_id,
      event_type: 'click',
      slot,
      date,
      occurred_at: timestamp
    })
  }

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
