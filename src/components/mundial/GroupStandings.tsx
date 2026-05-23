'use client'

import { getFlag, getTeamName } from './flags'
import type { GroupStanding, Partido, TeamStanding } from './types'

export function computeGroupStandings(partidos: Partido[]): GroupStanding[] {
  const groups = new Map<string, Map<string, TeamStanding>>()

  for (const p of partidos) {
    if (!p.grupo || p.estado !== 'FINISHED') continue
    if (p.goles_local == null || p.goles_visita == null) continue

    if (!groups.has(p.grupo)) groups.set(p.grupo, new Map())
    const group = groups.get(p.grupo)!

    const init = (name: string) => {
      if (!group.has(name))
        group.set(name, {
          team: name,
          pj: 0,
          g: 0,
          e: 0,
          p: 0,
          gf: 0,
          ga: 0,
          pts: 0
        })
    }

    init(p.equipo_local)
    init(p.equipo_visita)

    const home = group.get(p.equipo_local)!
    const away = group.get(p.equipo_visita)!

    home.pj++
    away.pj++
    home.gf += p.goles_local
    home.ga += p.goles_visita
    away.gf += p.goles_visita
    away.ga += p.goles_local

    if (p.goles_local > p.goles_visita) {
      home.g++
      home.pts += 3
      away.p++
    } else if (p.goles_local < p.goles_visita) {
      away.g++
      away.pts += 3
      home.p++
    } else {
      home.e++
      home.pts++
      away.e++
      away.pts++
    }
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([grupo, teamsMap]) => ({
      grupo,
      teams: Array.from(teamsMap.values()).sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts
        const gdDiff = b.gf - b.ga - (a.gf - a.ga)
        if (gdDiff !== 0) return gdDiff
        return b.gf - a.gf
      })
    }))
}

const GroupTable = ({ standing }: { standing: GroupStanding }) => (
  <div className='overflow-hidden rounded-lg ring-1 ring-white/10'>
    <div className='bg-[#0d1f3c]/90 px-3 py-2 text-[11px] font-bold tracking-widest text-blue-200 uppercase'>
      {standing.grupo}
    </div>
    <table className='w-full text-xs'>
      <thead>
        <tr className='bg-[#0b1a35]/60 text-[10px] tracking-wider text-gray-300 uppercase'>
          <th className='px-3 py-1.5 text-left'>Equipo</th>
          <th className='px-1.5 py-1.5 text-center'>PJ</th>
          <th className='px-1.5 py-1.5 text-center'>G</th>
          <th className='px-1.5 py-1.5 text-center'>E</th>
          <th className='px-1.5 py-1.5 text-center'>P</th>
          <th className='px-1.5 py-1.5 text-center'>DG</th>
          <th className='px-2 py-1.5 text-center font-bold text-white/90'>
            Pts
          </th>
        </tr>
      </thead>
      <tbody>
        {standing.teams.map((team, i) => (
          <tr
            key={team.team}
            className={`border-t border-white/5 ${i < 2 ? 'bg-[#0d1f3c]/40' : 'bg-transparent'}`}
          >
            <td className='px-3 py-2'>
              <div className='flex items-center gap-1.5'>
                <span
                  className={`text-[10px] font-bold ${i < 2 ? 'text-green-400' : 'text-gray-300'}`}
                >
                  {i + 1}
                </span>
                <span className='text-base leading-none'>
                  {getFlag(team.team)}
                </span>
                <span className='truncate text-[11px] font-medium text-white'>
                  {getTeamName(team.team)}
                </span>
              </div>
            </td>
            <td className='px-1.5 py-2 text-center text-gray-200'>{team.pj}</td>
            <td className='px-1.5 py-2 text-center text-gray-200'>{team.g}</td>
            <td className='px-1.5 py-2 text-center text-gray-200'>{team.e}</td>
            <td className='px-1.5 py-2 text-center text-gray-200'>{team.p}</td>
            <td className='px-1.5 py-2 text-center text-gray-200'>
              {team.gf - team.ga > 0
                ? `+${team.gf - team.ga}`
                : team.gf - team.ga}
            </td>
            <td className='px-2 py-2 text-center font-black text-white'>
              {team.pts}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export const GroupStandings = ({
  standings
}: {
  standings: GroupStanding[]
}) => {
  if (standings.length === 0) {
    return (
      <p className='py-8 text-center text-sm text-gray-300'>
        Las posiciones estarán disponibles una vez comiencen los partidos.
      </p>
    )
  }

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      {standings.map(s => (
        <GroupTable key={s.grupo} standing={s} />
      ))}
    </div>
  )
}
