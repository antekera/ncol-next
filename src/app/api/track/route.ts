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

  const occurred_at = new Date().toISOString().replace('T', ' ').slice(0, 19)
  const events: Record<string, unknown>[] = []

  for (let i = 0; i < (views ?? 0); i++) {
    events.push({ ad_id, event_type: 'view', slot, date, occurred_at })
  }
  for (let i = 0; i < (clicks ?? 0); i++) {
    events.push({ ad_id, event_type: 'click', slot, date, occurred_at })
  }

  if (events.length === 0) {
    return Response.json({ ok: true })
  }

  const token = process.env.TINYBIRD_TOKEN ?? ''
  const baseUrl =
    process.env.TINYBIRD_URL ?? 'https://api.us-east.aws.tinybird.co'
  const ndjson = events.map(e => JSON.stringify(e)).join('\n')

  try {
    const res = await fetch(
      `${baseUrl}/v0/events?name=ad_events&token=${encodeURIComponent(token)}`,
      { method: 'POST', body: ndjson }
    )
    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.error('Tinybird append failed:', res.status)
      return Response.json({ error: 'analytics error' }, { status: 500 })
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Tinybird append error:', err)
    return Response.json({ error: 'analytics error' }, { status: 500 })
  }

  return Response.json({ ok: true })
}
