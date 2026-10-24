'use client'

import { Newsletter } from '@components/Newsletter'
import { DenunciaSidebar } from '@components/Sidebar/DenunciaSidebar'
import { HoroscopoSidebar } from '@components/Sidebar/HoroscopoSidebar'
import { DolarSidebar } from '@components/Sidebar/DolarSidebar'
import { AvisosSidebar } from '@components/Sidebar/AvisosSidebar'
import { ClasificadosSidebar } from '@components/Sidebar/ClasificadosSidebar'
import { Ad } from '@components/Sidebar/Ad'
import { SidebarRankings } from '@components/SidebarRankings'
import { TagCloud } from '@components/TagCloud'
import { useIsMobile } from '@lib/hooks/useIsMobile'

interface Props {
  children?: React.ReactNode
  offsetTop?: number
  hideMostVisited?: boolean
  servicesFirst?: boolean
  homeMeasurement?: boolean
}

const ServicesSection = ({
  mobileVisible,
  homeMeasurement
}: {
  mobileVisible: boolean
  homeMeasurement?: boolean
}) => (
  <section
    aria-labelledby='sidebar-services-heading'
    className={mobileVisible ? 'block' : 'hidden md:block'}
    data-module-id={homeMeasurement ? 'services' : undefined}
    data-editorial-position={homeMeasurement ? 1 : undefined}
    data-component-type={homeMeasurement ? 'service_link' : undefined}
  >
    <p
      id='sidebar-services-heading'
      data-module-marker={homeMeasurement ? true : undefined}
      className='mb-3 border-b border-slate-200 pb-2 font-sans text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase'
    >
      Herramientas y servicios
    </p>
    <DolarSidebar className={mobileVisible ? undefined : 'hidden md:block'} />
    <HoroscopoSidebar
      className={mobileVisible ? undefined : 'hidden md:block'}
    />
    <DenunciaSidebar
      className={mobileVisible ? undefined : 'hidden md:block'}
    />
    <AvisosSidebar className={mobileVisible ? undefined : 'hidden md:block'} />
    <ClasificadosSidebar
      className={mobileVisible ? undefined : 'hidden md:block'}
    />
  </section>
)

const Sidebar = ({
  children,
  offsetTop,
  hideMostVisited,
  servicesFirst,
  homeMeasurement
}: Partial<Props>) => {
  const isMobile = useIsMobile()

  return (
    <aside className='w-full px-2 md:w-1/3 lg:w-1/4'>
      {servicesFirst ? (
        <>
          <Newsletter className='mb-6 md:mb-6' />
          <ServicesSection
            mobileVisible={true}
            homeMeasurement={homeMeasurement}
          />
          {!isMobile && !hideMostVisited && (
            <div className='hidden md:block'>
              <SidebarRankings homeMeasurement={homeMeasurement} />
            </div>
          )}
        </>
      ) : (
        <>
          {!isMobile && !hideMostVisited && (
            <div className='hidden md:block'>
              <SidebarRankings homeMeasurement={homeMeasurement} />
            </div>
          )}
          <Newsletter className='hidden md:mb-6 md:block' />
          <ServicesSection
            mobileVisible={false}
            homeMeasurement={homeMeasurement}
          />
        </>
      )}
      <TagCloud title='Temas de interés' className='mb-8 font-sans md:mb-4' />
      {children && <div className='mb-4 hidden md:block'>{children}</div>}
      <Ad offsetTop={offsetTop} />
    </aside>
  )
}

export { Sidebar }
