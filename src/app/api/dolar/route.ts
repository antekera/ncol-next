import { NextResponse } from 'next/server'
import { tursoDolar } from '@lib/turso'

export async function GET() {
  const rows = await tursoDolar.execute(`
    WITH ranked_rates AS (
      SELECT *,
        ROW_NUMBER() OVER (PARTITION BY id ORDER BY fetched_at DESC) as rn
      FROM exchange_rates
      WHERE id IN ('paralelo', 'bitcoin', 'oficial')
    )
    SELECT * FROM ranked_rates
    WHERE rn <= 2
    ORDER BY id, fetched_at DESC
  `)
  const filtered = rows.rows.map((row: any) => ({
    id: row.id,
    source: row.source,
    price: row.price,
    last_update: row.last_update,
    fetched_at: row.fetched_at
  }))
  return NextResponse.json(filtered)
}
