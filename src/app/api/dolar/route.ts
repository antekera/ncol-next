import { NextResponse } from 'next/server'
import { tursoDolar } from '@lib/turso'

export async function GET() {
  const rows = await tursoDolar.execute(`
    SELECT * FROM exchange_rates
    WHERE (id, fetched_at) IN (
      SELECT id, MAX(fetched_at)
      FROM exchange_rates
      WHERE id IN ('bcv', 'enparalelovzla', 'bcv_euro', 'enparalelovzla_euro')
      GROUP BY id
    )
  `)
  const filtered = rows.rows.map((row: any) => ({
    id: row.id,
    source: row.source,
    price: row.price,
    symbol: row.symbol,
    last_update: row.last_update
  }))
  return NextResponse.json(filtered)
}
