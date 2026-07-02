'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Container } from '@components/Container'
import { GAEvent } from '@lib/utils/ga'
import { CircleArrowRight } from 'lucide-react'
import { GA_EVENTS } from '@lib/constants'

export const WorldCupBanner = () => {
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
        sizes='100vw'
      />
      {/* Background image — mobile */}
      <Image
        src='/wc2026-banner-mobile.png'
        alt=''
        fill
        className='object-cover object-center md:hidden'
        sizes='100vw'
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
            <p className='mt-2 flex justify-center text-[10px] text-gray-200 md:justify-start'>
              📅 11 Junio – 19 Julio 2026
            </p>
          </div>

          {/* Right */}
          <div className='flex shrink-0 flex-col items-center md:items-end'>
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
