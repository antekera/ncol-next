import { NextResponse } from 'next/server'
import { getTursoHoroscopo } from '@lib/turso'

// Valid zodiac signs for early validation
const VALID_SIGNOS = [
  'aries',
  'tauro',
  'geminis',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'escorpio',
  'sagitario',
  'capricornio',
  'acuario',
  'piscis'
]

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ signo: string }> }
) {
  try {
    const { signo } = await params
    const signoLower = signo.toLowerCase()

    // Early validation - reject invalid signos immediately
    if (!VALID_SIGNOS.includes(signoLower)) {
      return NextResponse.json(
        { error: 'Invalid zodiac sign' },
        { status: 404 }
      )
    }

    const rows = await getTursoHoroscopo().execute({
      sql: `
        SELECT * FROM horoscopo 
        WHERE signo = ? 
          AND semana_inicio <= date('now')
          AND semana_fin >= date('now')
        LIMIT 1
      `,
      args: [signoLower]
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
