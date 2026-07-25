'use client'

import { Newsletter } from '@components/Newsletter'
import { DenunciaSidebar } from '@components/Sidebar/DenunciaSidebar'
import { HoroscopoSidebar } from '@components/Sidebar/HoroscopoSidebar'
import { DolarSidebar } from '@components/Sidebar/DolarSidebar'
import { AvisosSidebar } from '@components/Sidebar/AvisosSidebar'
import { Ad } from '@components/Sidebar/Ad'
import { SidebarRankings } from '@components/SidebarRankings'
import { TagCloud } from '@components/TagCloud'
import { useIsMobile } from '@lib/hooks/useIsMobile'
import { AdSenseBanner } from '@components/AdSenseBanner'
import { ad } from '@lib/ads'

interface Props {
  children?: React.ReactNode
  offsetTop?: number
  hideMostVisited?: boolean
}

const Sidebar = ({ children, offsetTop, hideMostVisited }: Partial<Props>) => {
  const isMobile = useIsMobile()

  return (
    <aside className='w-full px-2 md:w-1/3 lg:w-1/4'>
      {!isMobile && !hideMostVisited && (
        <div className='hidden md:block'>
          <SidebarRankings />
        </div>
      )}
      <Newsletter className='hidden md:mb-6 md:block' />
      <section
        aria-labelledby='sidebar-services-heading'
        className='hidden md:block'
      >
        <p
          id='sidebar-services-heading'
          className='mb-3 border-b border-slate-200 pb-2 font-sans text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase'
        >
          Herramientas y servicios
        </p>
        <DolarSidebar className='hidden md:block' />
        <HoroscopoSidebar className='hidden md:block' />
        <DenunciaSidebar className='hidden md:block' />
        <AvisosSidebar className='hidden md:block' />
      </section>
      <TagCloud title='Temas de interés' className='mb-8 font-sans md:mb-4' />
      {children && <div className='mb-4'>{children}</div>}
      <AdSenseBanner {...ad.global.sidebar} className='mb-2' />
      <Ad offsetTop={offsetTop} />
    </aside>
  )
}

export { Sidebar }
