import { NextResponse } from 'next/server'
import { getTursoHoroscopo } from '@lib/turso'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ signo: string }> }
) {
  try {
    const { signo } = await params

    const rows = await getTursoHoroscopo().execute({
      sql: `
        SELECT * FROM horoscopo 
        WHERE signo = ? 
          AND semana_inicio <= date('now')
          AND semana_fin >= date('now')
        LIMIT 1
      `,
      args: [signo.toLowerCase()]
    })

    if (rows.rows.length === 0) {
      return NextResponse.json(
        { error: 'Horoscopo not found for this signo' },
        { status: 404 }
      )
    }

    return NextResponse.json(rows.rows[0], {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch horoscopo data' },
      { status: 500 }
    )
  }
}
