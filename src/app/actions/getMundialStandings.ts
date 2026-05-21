'use server'

import { fetchStandingsMundial } from '@lib/football-api'
import type { GroupStanding } from '@components/mundial/types'
import { log } from '@logtail/next'

export async function getMundialStandings(): Promise<GroupStanding[]> {
  try {
    const standingsData = await fetchStandingsMundial()
    if (!standingsData || !standingsData.standings) {
      return []
    }

    const translateGroup = (groupStr: string): string => {
      if (!groupStr) return ''
      if (groupStr.startsWith('GROUP_')) {
        return `Grupo ${groupStr.replace('GROUP_', '')}`
      }
      return groupStr
    }

    const normalizeTeamName = (name: string): string => {
      if (name === 'Korea Republic') return 'South Korea'
      if (name === 'IR Iran') return 'Iran'
      return name
    }

    const totalStandings = standingsData.standings.filter(
      s => s.type === 'TOTAL'
    )
    const groupedStandings = totalStandings.filter(s => s.group != null)

    const fallbackStandings: GroupStanding[] = []

    if (groupedStandings.length > 0) {
      const sortedGroups = [...groupedStandings]
      sortedGroups.sort((a, b) => a.group.localeCompare(b.group))
      return sortedGroups.map(s => ({
        grupo: translateGroup(s.group),
        teams: s.table.map(t => ({
          team: normalizeTeamName(t.team.name),
          pj: t.playedGames,
          g: t.won,
          e: t.draw,
          p: t.lost,
          gf: t.goalsFor,
          ga: t.goalsAgainst,
          pts: t.points
        }))
      }))
    } else {
      const flatTotal = totalStandings.find(s => s.group === null)
      if (flatTotal?.table) {
        const { table } = flatTotal
        const chunkSize = 4
        for (let i = 0; i < table.length; i += chunkSize) {
          const groupIndex = Math.floor(i / chunkSize)
          const groupChar = String.fromCharCode(65 + groupIndex)
          const chunk = table.slice(i, i + chunkSize)
          fallbackStandings.push({
            grupo: `Grupo ${groupChar}`,
            teams: chunk.map(t => ({
              team: normalizeTeamName(t.team.name),
              pj: t.playedGames,
              g: t.won,
              e: t.draw,
              p: t.lost,
              gf: t.goalsFor,
              ga: t.goalsAgainst,
              pts: t.points
            }))
          })
        }
      }
    }
    return fallbackStandings
  } catch (err) {
    log.error('Error fetching/mapping standings from API', {
      error: err instanceof Error ? err.message : String(err)
    })
    return []
  }
}
