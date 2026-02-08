import { NextResponse } from 'next/server'
import { getTursoHoroscopo } from '@lib/turso'

export const dynamic = 'force-dynamic'

// Zodiac order for consistent sorting
const ZODIAC_ORDER = [
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

export async function GET() {
  try {
    const isSunday = new Date().getDay() === 0

    const rows = await getTursoHoroscopo().execute(`
      SELECT * FROM horoscopo h1
      WHERE h1.semana_inicio <= date('now')
        AND h1.semana_fin >= date('now')
        AND h1.created_at = (
            SELECT MAX(created_at) FROM horoscopo h2 
            WHERE h2.signo = h1.signo 
            AND h2.semana_inicio <= date('now')
            AND h2.semana_fin >= date('now')
        )
    `)

    // Sort by zodiac order
    const sorted = [...rows.rows].sort((a: any, b: any) => {
      const aIndex = ZODIAC_ORDER.indexOf(a.signo as string)
      const bIndex = ZODIAC_ORDER.indexOf(b.signo as string)
      return aIndex - bIndex
    })

    return NextResponse.json(sorted, {
      headers: {
        'Cache-Control': isSunday
          ? 'no-store, max-age=0, must-revalidate'
          : 'public, max-age=3600, s-maxage=3600'
      }
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch horoscopo data' },
      { status: 500 }
    )
  }
}
