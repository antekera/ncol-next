import type { StandingsApiResponse } from './types'

export async function fetchStandingsMundial(): Promise<StandingsApiResponse> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY
  if (!apiKey) {
    throw new Error(
      'FOOTBALL_DATA_API_KEY is not defined in environment variables'
    )
  }

  const options: any = {
    headers: { 'X-Auth-Token': apiKey },
    next: { revalidate: 3600 } // Next.js ISR: cache 1 hour
  }

  const res = await fetch(
    `https://api.football-data.org/v4/competitions/WC/standings?season=2026`,
    options
  )

  if (!res.ok) {
    throw new Error(`Failed to fetch World Cup standings: ${res.statusText}`)
  }

  return res.json()
}
