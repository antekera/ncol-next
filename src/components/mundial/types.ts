export type EstadoPartido =
  | 'SCHEDULED'
  | 'TIMED'
  | 'LIVE'
  | 'FINISHED'
  | 'POSTPONED'
  | 'IN_PLAY'
  | 'PAUSED'
  | 'SUSPENDED'
  | 'CANCELED'

export interface Partido {
  id: string
  equipo_local: string
  equipo_visita: string
  escudo_local: string | null
  escudo_visita: string | null
  fecha_partido: string
  goles_local: number | null
  goles_visita: number | null
  estado: EstadoPartido
  minuto: string | null
  grupo: string | null
}

export interface TeamStanding {
  team: string
  pj: number
  g: number
  e: number
  p: number
  gf: number
  ga: number
  pts: number
}

export interface GroupStanding {
  grupo: string
  teams: TeamStanding[]
}
