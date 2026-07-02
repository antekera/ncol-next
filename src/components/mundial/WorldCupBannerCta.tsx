'use client'

import Link from 'next/link'
import { CircleArrowRight } from 'lucide-react'
import { GA_EVENTS } from '@lib/constants'
import { GAEvent } from '@lib/utils/ga'

export const WorldCupBannerCta = () => {
  return (
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
      Ver Calendario y Resultados <CircleArrowRight className='h-4 w-4' />
    </Link>
  )
}
