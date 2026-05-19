'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Container } from '@components/Container'
import { GAEvent } from '@lib/utils/ga'
import { CircleArrowRight } from 'lucide-react'
import { GA_EVENTS } from '@lib/constants'

const WC_TARGET = '2026-06-11T00:00:00-04:00'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  expired: boolean
}

function getTimeLeft(): TimeLeft {
  const diff = new Date(WC_TARGET).getTime() - Date.now()
  if (diff <= 0)
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    expired: false
  }
}

const CountBox = ({ value, label }: { value?: number; label: string }) => (
  <div className='flex h-12 min-w-[52px] flex-col items-center rounded bg-[#0d1f3c]/90 px-2.5 py-1 text-center ring-1 ring-white/10 md:min-w-[64px] md:px-3'>
    <span className='font-sans text-xl leading-none font-black text-white tabular-nums md:text-2xl'>
      {value != null ? String(value).padStart(2, '0') : ''}
    </span>
    <span className='mt-0.5 font-sans text-[9px] tracking-widest text-gray-400 uppercase'>
      {value != null ? label : ''}
    </span>
  </div>
)

export const WorldCupBanner = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

  useEffect(() => {
    setTimeLeft(getTimeLeft())
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  const expired = timeLeft?.expired ?? false
  const pathname = usePathname()

  if (pathname === '/categoria/mundial-2026/') return null

  return (
    <div className='relative h-[240px] overflow-hidden bg-[#0b1a35] font-sans text-white md:h-[130px]'>
      {/* Background image — desktop */}
      <Image
        src='/wc2026-banner.png'
        alt=''
        fill
        className='hidden object-cover object-center md:block'
        priority
      />
      {/* Background image — mobile */}
      <Image
        src='/wc2026-banner-mobile.png'
        alt=''
        fill
        className='object-cover object-center md:hidden'
        priority
      />

      {/* Content fills the fixed height */}
      <Container className='relative flex h-full items-center py-3 md:py-4'>
        <div className='flex w-full flex-col items-center justify-between gap-4 md:flex-row'>
          {/* Left */}
          <div className='flex flex-col items-center text-center md:items-start md:text-left'>
            <h2 className='mt-0.5 text-2xl leading-tight font-black tracking-tight uppercase [text-shadow:0_2px_8px_rgba(0,0,0,0.9)] md:text-3xl lg:text-4xl'>
              FIFA World Cup 2026™
            </h2>
            <div className='mt-1.5 flex items-center justify-center gap-2 text-xs font-medium md:justify-start'>
              <span>
                🇺🇸 <span className='opacity-80'>USA</span>
              </span>
              <span className='opacity-30'>|</span>
              <span>
                🇲🇽 <span className='opacity-80'>México</span>
              </span>
              <span className='opacity-30'>|</span>
              <span>
                🇨🇦 <span className='opacity-80'>Canadá</span>
              </span>
            </div>
            {!expired && (
              <p className='mt-2 flex justify-center text-[10px] text-gray-200 md:justify-start'>
                📅 11 Junio – 19 Julio 2026
              </p>
            )}
          </div>

          {/* Right */}
          <div className='flex shrink-0 flex-col items-center md:items-end'>
            {!expired && (
              <>
                <p className='mb-1.5 text-[9px] tracking-[0.18em] text-gray-200 uppercase'>
                  Cuenta regresiva
                </p>
                <div className='mb-2 flex items-center gap-2'>
                  <CountBox value={timeLeft?.days} label='Días' />
                  <span className='mb-3 text-lg font-bold text-gray-500'>
                    :
                  </span>
                  <CountBox value={timeLeft?.hours} label='Horas' />
                  <span className='mb-3 text-lg font-bold text-gray-500'>
                    :
                  </span>
                  <CountBox value={timeLeft?.minutes} label='Mins' />
                  <span className='mb-3 text-lg font-bold text-gray-500'>
                    :
                  </span>
                  <CountBox value={timeLeft?.seconds} label='Segs' />
                </div>
              </>
            )}
            <Link
              href='/categoria/mundial-2026/'
              className='inline-flex items-center gap-1.5 rounded bg-red-600 px-4 py-2 text-xs font-bold tracking-wide text-white uppercase transition-colors hover:bg-red-500'
              onClick={() =>
                GAEvent({
                  category: GA_EVENTS.WORLD_CUP_BANNER.CATEGORY,
                  label: GA_EVENTS.WORLD_CUP_BANNER.CLICK_CTA
                })
              }
            >
              Ver Calendario y Resultados{' '}
              <CircleArrowRight className='h-4 w-4' />
            </Link>
          </div>
        </div>
      </Container>
    </div>
  )
}
