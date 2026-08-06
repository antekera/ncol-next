'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react'
import useSWR from 'swr'
import { useInView } from 'react-intersection-observer'
import { cn } from '@lib/shared'
import { DOLAR_HOY_SLUG } from '@lib/constants'
import { Skeleton } from '@components/ui/skeleton'
import { BCV_API_URL, BcvResponse, bcvFetcher } from '@lib/api/BcvRatesClient'

const fmt = (n: number) =>
  n.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

type Trend = 'up' | 'down' | 'flat'

const getTrend = (pct: number): Trend => {
  if (pct > 0) return 'up'
  if (pct < 0) return 'down'
  return 'flat'
}

const getTrendIcon = (t: Trend): React.ElementType => {
  if (t === 'up') return TrendingUp
  if (t === 'down') return TrendingDown
  return Minus
}

const getTrendIconColor = (t: Trend): string => {
  if (t === 'up') return 'text-emerald-300'
  if (t === 'down') return 'text-red-300'
  return 'text-white/50'
}

interface DolarSidebarProps {
  className?: string
}

export const DolarSidebar: React.FC<DolarSidebarProps> = ({ className }) => {
  const href = `/${DOLAR_HOY_SLUG}`
  const pathname = usePathname()
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '100px' })

  const { data, isLoading } = useSWR<BcvResponse>(
    pathname === href || !inView ? null : BCV_API_URL,
    bcvFetcher,
    { refreshInterval: 60 * 60 * 1000 }
  )

  const trend = useMemo(() => getTrend(data?.changePercentage.usd ?? 0), [data])

  if (pathname === href) return null

  const TrendIcon = getTrendIcon(trend)
  const trendIconColor = getTrendIconColor(trend)
  const usd = data?.current.usd
  const eur = data?.current.eur

  return (
    <Link
      ref={ref}
      href={href}
      aria-label='Ver tasa del dólar BCV y calculadora de divisas'
      className={cn('group relative z-10 mb-6 block md:mb-4', className)}
    >
      <div className='relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 via-green-600 to-green-800 p-4 font-sans text-white shadow-lg transition-all duration-500 hover:shadow-xl hover:shadow-green-500/25'>
        <div className='absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100' />

        {/* Header */}
        <div className='relative mb-2 flex items-center justify-between'>
          <span className='text-base font-extrabold tracking-tight text-white'>
            Dólar BCV Hoy
          </span>
          <TrendIcon
            size={15}
            className={cn('flex-shrink-0', trendIconColor)}
          />
        </div>

        {/* USD Rate */}
        <div className='relative flex items-baseline gap-1.5'>
          {isLoading ? (
            <Skeleton className='h-9 w-32 bg-white/20' />
          ) : (
            <>
              <span className='text-4xl font-black tracking-tight'>
                {usd ? fmt(usd).split(',')[0] : '—'}
              </span>
              {usd && (
                <span className='text-xl font-bold text-white/70'>
                  ,{fmt(usd).split(',')[1]}
                </span>
              )}
              <span className='mb-0.5 self-end text-xs font-semibold text-green-100/70'>
                Bs/$
              </span>
            </>
          )}
        </div>

        {/* EUR */}
        <div className='relative mb-4'>
          {isLoading ? (
            <Skeleton className='h-3.5 w-24 bg-white/20' />
          ) : (
            eur && (
              <span className='text-xs text-green-100/70'>
                EUR <span className='font-bold text-white'>{fmt(eur)}</span> Bs
              </span>
            )
          )}
        </div>

        {/* CTA */}
        <div className='relative flex items-center justify-between border-t border-white/15 pt-3'>
          <span className='text-xs font-semibold text-green-100/80'>
            Ir a calculadora
          </span>
          <ArrowRight
            size={14}
            className='transition-transform duration-300 group-hover:translate-x-1'
          />
        </div>
      </div>
    </Link>
  )
}
