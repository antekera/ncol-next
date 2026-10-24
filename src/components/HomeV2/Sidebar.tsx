import { SERVICES_MENU } from '@lib/constants'
import { HoverPrefetchLink } from '@components/HoverPrefetchLink'
import { NcolAdSlot } from '@components/NcolAdSlot'
import { BcvWidget, RankingWidget, OpinionWidget } from './SidebarFeeds'
import { SectionHeading } from './Section'
import styles from './HomeV2.module.css'

export function Sidebar({ part }: { part: 'before-videos' | 'after-videos' }) {
  const beforeVideos = part === 'before-videos'
  return (
    <aside
      className={`${styles.sidebar} ${beforeVideos ? styles.sidebarBeforeVideos : styles.sidebarAfterVideos}`}
      aria-label={
        beforeVideos ? 'Información destacada' : 'Opinión y servicios'
      }
    >
      {beforeVideos ? (
        <>
          <BcvWidget />
          <RankingWidget />
        </>
      ) : (
        <>
          <OpinionWidget />
          <section
            className={styles.serviceModule}
            aria-label='Herramientas y servicios'
            data-module-id='services'
            data-editorial-position='5'
          >
            <SectionHeading title='Herramientas y servicios' />
            <nav
              className={styles.services}
              aria-label='Servicios de NoticiasCol'
            >
              {SERVICES_MENU.map(service => {
                const Icon = service.icon
                return (
                  <HoverPrefetchLink
                    key={service.href}
                    href={service.href}
                    target={service.target}
                    data-service-id={service.href}
                    data-component-type='service_link'
                  >
                    {Icon && <Icon aria-hidden='true' />}
                    {service.name}
                  </HoverPrefetchLink>
                )
              })}
            </nav>
          </section>
          <div className={styles.sidebarBottom}>
            <div className={styles.ad}>
              <NcolAdSlot slot='sidebar' collapseEmpty />
            </div>
          </div>
        </>
      )}
    </aside>
  )
}
