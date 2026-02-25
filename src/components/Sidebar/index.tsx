'use client'

import { Newsletter } from '@components/Newsletter'
import { TrendingSidebar } from '@components/Sidebar/TrendingSidebar'
import { DenunciaSidebar } from '@components/Sidebar/DenunciaSidebar'
import { HoroscopoSidebar } from '@components/Sidebar/HoroscopoSidebar'
import { DolarSidebar } from '@components/Sidebar/DolarSidebar'
import { AvisosSidebar } from '@components/Sidebar/AvisosSidebar'
import { Ad } from '@components/Sidebar/Ad'
import { SocialLinks } from '@components/SocialLinks'
import { MostVisitedPosts } from '@components/MostVisitedPosts'
import { useIsMobile } from '@lib/hooks/useIsMobile'

interface Props {
  children?: React.ReactNode
  offsetTop?: number
  hideMostVisited?: boolean
}

const Sidebar = ({ children, offsetTop, hideMostVisited }: Partial<Props>) => {
  const isMobile = useIsMobile()

  return (
    <aside className='w-full px-2 md:w-1/3 lg:w-1/4'>
      <SocialLinks showBackground className='mb-4 hidden w-full md:flex' />
      <Newsletter className='hidden md:block' />
      <AvisosSidebar className='hidden md:block' />
      <DenunciaSidebar className='hidden md:block' />
      <HoroscopoSidebar className='hidden md:block' />
      <DolarSidebar className='hidden md:block' />
      <TrendingSidebar className='hidden md:block' />
      {!isMobile && !hideMostVisited && (
        <div className='mb-6'>
          <MostVisitedPosts className='sidebar-most-visited' />
        </div>
      )}
      {children && <div className='mb-4'>{children}</div>}
      <Ad offsetTop={offsetTop} />
    </aside>
  )
}

export { Sidebar }
