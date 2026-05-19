'use client'

import { getFlag, getTeamName } from './flags'
import type { Partido } from './types'

const LIVE_STATES = new Set(['LIVE', 'IN_PLAY', 'PAUSED'])
const FINISHED_STATES = new Set(['FINISHED'])

function formatMatchTime(dateStr: string): string {
  return new Intl.DateTimeFormat('es-VE', {
    timeZone: 'America/Caracas',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(dateStr))
}

function formatMatchDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-VE', {
    timeZone: 'America/Caracas',
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  }).format(new Date(dateStr))
}

function MatchStatusLabel({
  isLive,
  isFinished,
  minuto,
  time
}: {
  isLive: boolean
  isFinished: boolean
  minuto: string | null
  time: string
}) {
  if (isLive) {
    return (
      <span className='mt-1.5 flex items-center gap-1 rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase'>
        <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-white' />
        {minuto ? `${minuto}'` : 'EN VIVO'}
      </span>
    )
  }
  if (isFinished) {
    return (
      <span className='mt-1.5 text-[10px] text-gray-300 uppercase'>Final</span>
    )
  }
  return <span className='mt-1.5 text-[10px] text-gray-200'>{time}</span>
}

// Full card — used on the "Hoy" tab
export const MatchCard = ({ partido }: { partido: Partido }) => {
  const isLive = LIVE_STATES.has(partido.estado)
  const isFinished = FINISHED_STATES.has(partido.estado)
  const hasScore = isLive || isFinished

  return (
    <div className='rounded-lg bg-[#0d1f3c]/80 p-3 ring-1 ring-white/10'>
      <div className='mb-2.5 flex items-center justify-between gap-2 text-[10px] tracking-wider text-gray-200 uppercase'>
        <span className='font-semibold text-blue-300'>
          {partido.grupo ?? ''}
        </span>
        <span>
          {formatMatchDate(partido.fecha_partido)} ·{' '}
          {formatMatchTime(partido.fecha_partido)}
        </span>
      </div>

      <div className='flex items-center gap-2'>
        {/* Home team */}
        <div className='flex min-w-0 flex-1 flex-col items-center gap-1'>
          <span className='text-3xl leading-none'>
            {getFlag(partido.equipo_local)}
          </span>
          <span className='w-full truncate text-center text-[11px] font-semibold text-white'>
            {getTeamName(partido.equipo_local)}
          </span>
        </div>

        {/* Score / vs */}
        <div className='flex w-24 shrink-0 flex-col items-center justify-center'>
          {hasScore ? (
            <div className='flex items-center gap-1'>
              <span className='min-w-[1.5rem] text-center text-2xl font-black text-white tabular-nums'>
                {partido.goles_local ?? '–'}
              </span>
              <span className='text-gray-300'>—</span>
              <span className='min-w-[1.5rem] text-center text-2xl font-black text-white tabular-nums'>
                {partido.goles_visita ?? '–'}
              </span>
            </div>
          ) : (
            <span className='text-base font-bold text-gray-300'>vs</span>
          )}

          <MatchStatusLabel
            isLive={isLive}
            isFinished={isFinished}
            minuto={partido.minuto}
            time={formatMatchTime(partido.fecha_partido)}
          />
        </div>

        {/* Away team */}
        <div className='flex min-w-0 flex-1 flex-col items-center gap-1'>
          <span className='text-3xl leading-none'>
            {getFlag(partido.equipo_visita)}
          </span>
          <span className='w-full truncate text-center text-[11px] font-semibold text-white'>
            {getTeamName(partido.equipo_visita)}
          </span>
        </div>
      </div>
    </div>
  )
}

// Compact row card — used on "Próximos" and "Resultados" tabs (date already shown in day header)
export const MatchCardCompact = ({ partido }: { partido: Partido }) => {
  const isLive = LIVE_STATES.has(partido.estado)
  const isFinished = FINISHED_STATES.has(partido.estado)
  const hasScore = isLive || isFinished

  return (
    <div className='flex items-center gap-2 rounded-lg bg-[#0d1f3c]/80 px-3 py-2 ring-1 ring-white/10'>
      {/* Home team */}
      <div className='flex min-w-0 flex-1 items-center gap-1.5'>
        <span className='shrink-0 text-xl leading-none'>
          {getFlag(partido.equipo_local)}
        </span>
        <span className='truncate text-xs font-semibold text-white'>
          {getTeamName(partido.equipo_local)}
        </span>
      </div>

      {/* Center: score or time + status + group */}
      <div className='flex w-28 shrink-0 flex-col items-center'>
        {hasScore ? (
          <div className='flex items-center gap-1 text-sm font-black text-white tabular-nums'>
            <span>{partido.goles_local ?? '–'}</span>
            <span className='text-gray-400'>—</span>
            <span>{partido.goles_visita ?? '–'}</span>
          </div>
        ) : (
          <span className='text-xs font-bold text-gray-100'>
            {formatMatchTime(partido.fecha_partido)}
          </span>
        )}

        <div className='mt-0.5 flex items-center gap-1.5'>
          {isLive && (
            <span className='flex items-center gap-1 rounded bg-red-600 px-1.5 py-px text-[9px] font-bold text-white uppercase'>
              <span className='h-1 w-1 animate-pulse rounded-full bg-white' />
              {partido.minuto ? `${partido.minuto}'` : 'EN VIVO'}
            </span>
          )}
          {isFinished && (
            <span className='text-[9px] text-gray-400 uppercase'>Final</span>
          )}
          {partido.grupo && (
            <span className='text-[9px] text-blue-300/80'>{partido.grupo}</span>
          )}
        </div>
      </div>

      {/* Away team */}
      <div className='flex min-w-0 flex-1 items-center justify-end gap-1.5'>
        <span className='truncate text-right text-xs font-semibold text-white'>
          {getTeamName(partido.equipo_visita)}
        </span>
        <span className='shrink-0 text-xl leading-none'>
          {getFlag(partido.equipo_visita)}
        </span>
      </div>
    </div>
  )
}
