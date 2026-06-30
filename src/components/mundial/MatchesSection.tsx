'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { supabase } from '@lib/supabase/client'
import { MatchCard, MatchCardCompact } from './MatchCard'
import { GroupStandings, computeGroupStandings } from './GroupStandings'
import { GroupStandingsSkeleton, MatchesSkeleton } from './Skeleton'
import type { Partido } from './types'

type Tab = 'hoy' | 'proximos' | 'resultados' | 'grupos'

const TZ = 'America/Caracas'

function getVzDateStr(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

function isToday(dateStr: string): boolean {
  return getVzDateStr(new Date(dateStr)) === getVzDateStr()
}

function isUpcoming(p: Partido): boolean {
  return (
    (p.estado === 'SCHEDULED' || p.estado === 'TIMED') &&
    !isToday(p.fecha_partido)
  )
}

function isLive(p: Partido): boolean {
  return p.estado === 'LIVE' || p.estado === 'IN_PLAY' || p.estado === 'PAUSED'
}

function formatDayHeader(dateStr: string): string {
  return new Intl.DateTimeFormat('es-VE', {
    timeZone: TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date(dateStr))
}

function groupByDay(partidos: Partido[]): [string, Partido[]][] {
  const map = new Map<string, Partido[]>()
  for (const p of partidos) {
    const key = getVzDateStr(new Date(p.fecha_partido))
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(p)
  }
  return Array.from(map.entries())
}

const TabButton = ({
  active,
  onClick,
  children,
  dot
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  dot?: boolean
}) => (
  <button
    onClick={onClick}
    className={`relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
      active
        ? 'bg-white/15 text-white'
        : 'text-gray-200 hover:bg-white/5 hover:text-white'
    }`}
  >
    {dot && (
      <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-red-500' />
    )}
    {children}
  </button>
)

const DaySection = ({
  dayStr,
  partidos
}: {
  dayStr: string
  partidos: Partido[]
}) => (
  <div>
    <h3 className='mb-2 text-[11px] font-semibold tracking-widest text-gray-200 uppercase first-letter:capitalize'>
      {formatDayHeader(dayStr + 'T12:00:00')}
    </h3>
    <div className='grid grid-cols-1 gap-1.5 md:grid-cols-2'>
      {partidos.map(p => (
        <MatchCardCompact key={p.id} partido={p} />
      ))}
    </div>
  </div>
)

export const MatchesSection = () => {
  const [partidos, setPartidos] = useState<Partido[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<Tab | null>(null)

  const fetchPartidos = async () => {
    const { data } = await supabase
      .from('partidos')
      .select(
        'id,equipo_local,equipo_visita,escudo_local,escudo_visita,fecha_partido,goles_local,goles_visita,penales_local,penales_visita,estado,minuto,grupo'
      )
      .order('fecha_partido', { ascending: true })
    if (data) setPartidos(data)
    setLoading(false)
  }

  useEffect(() => {
    void fetchPartidos()
    // Refresh every 60s to catch live score updates
    const id = setInterval(() => {
      void fetchPartidos()
    }, 60_000)
    return () => clearInterval(id)
  }, [])

  const { todayMatches, upcomingMatches, finishedMatches, hasLive } =
    useMemo(() => {
      const todayAll = partidos.filter(
        p => isToday(p.fecha_partido) || isLive(p)
      )
      const upcoming = partidos.filter(isUpcoming).slice(0, 30) // next 30 matches
      const finished = [...partidos]
        .filter(p => p.estado === 'FINISHED')
        .reverse()
        .slice(0, 60) // last 60 results
      const live = partidos.some(isLive)
      return {
        todayMatches: todayAll,
        upcomingMatches: upcoming,
        finishedMatches: finished,
        hasLive: live
      }
    }, [partidos])

  const computedStandings = useMemo(() => {
    return computeGroupStandings(partidos)
  }, [partidos])

  const standings = useMemo(() => {
    return computedStandings
  }, [computedStandings])

  function defaultTab(): Tab {
    if (todayMatches.length > 0) return 'hoy'
    if (upcomingMatches.length > 0) return 'proximos'
    if (finishedMatches.length > 0) return 'resultados'
    return 'grupos'
  }

  const activeTab: Tab = selectedTab ?? defaultTab()

  const upcomingByDay = groupByDay(upcomingMatches)
  const finishedByDay = groupByDay(finishedMatches)

  return (
    <div className='bg-[#0b1a35] font-sans text-white'>
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
        {/* Header row */}
        <div className='mb-4 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between'>
          <h2 className='text-base font-black tracking-tight text-white uppercase [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]'>
            ⚽ Partidos FIFA World Cup 2026™
          </h2>
          <a
            href='#noticias-recientes'
            className='flex items-center gap-1 text-xs font-medium text-blue-300/80 transition-colors hover:text-blue-200'
          >
            Noticias recientes <ChevronDown className='h-3.5 w-3.5' />
          </a>
        </div>

        {/* Tabs */}
        <div className='mb-4 flex gap-1 border-b border-white/10 pb-3'>
          <TabButton
            active={activeTab === 'hoy'}
            onClick={() => setSelectedTab('hoy')}
            dot={hasLive}
          >
            Hoy
          </TabButton>
          <TabButton
            active={activeTab === 'proximos'}
            onClick={() => setSelectedTab('proximos')}
          >
            Próximos
          </TabButton>
          <TabButton
            active={activeTab === 'resultados'}
            onClick={() => setSelectedTab('resultados')}
          >
            Resultados
          </TabButton>
          <TabButton
            active={activeTab === 'grupos'}
            onClick={() => setSelectedTab('grupos')}
          >
            Grupos
          </TabButton>
        </div>

        {/* Tab content */}
        {loading && activeTab === 'grupos' && <GroupStandingsSkeleton />}
        {loading && activeTab !== 'grupos' && <MatchesSkeleton />}
        {!loading && (
          <>
            {activeTab === 'hoy' && (
              <>
                {todayMatches.length > 0 ? (
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                    {todayMatches.map(p => (
                      <MatchCard key={p.id} partido={p} />
                    ))}
                  </div>
                ) : (
                  <div className='py-10 text-center'>
                    <p className='text-sm text-gray-400'>
                      No hay partidos programados para hoy.
                    </p>
                    {upcomingMatches[0] && (
                      <button
                        onClick={() => setSelectedTab('proximos')}
                        className='mt-3 text-xs text-blue-300 underline underline-offset-2 hover:text-blue-200'
                      >
                        Ver próximos partidos →
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === 'proximos' && (
              <>
                {upcomingByDay.length > 0 ? (
                  <div className='space-y-6'>
                    {upcomingByDay.map(([day, matches]) => (
                      <DaySection key={day} dayStr={day} partidos={matches} />
                    ))}
                  </div>
                ) : (
                  <p className='py-10 text-center text-sm text-gray-400'>
                    No hay partidos próximos disponibles.
                  </p>
                )}
              </>
            )}

            {activeTab === 'resultados' && (
              <>
                {finishedByDay.length > 0 ? (
                  <div className='space-y-6'>
                    {finishedByDay.map(([day, matches]) => (
                      <DaySection key={day} dayStr={day} partidos={matches} />
                    ))}
                  </div>
                ) : (
                  <p className='py-10 text-center text-sm text-gray-400'>
                    Aún no hay resultados disponibles.
                  </p>
                )}
              </>
            )}

            {activeTab === 'grupos' && (
              <>
                <GroupStandings standings={standings} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
