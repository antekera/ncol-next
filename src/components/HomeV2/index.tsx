import type { HomeV2Data, HomeSection } from '@lib/homeV2/types'
import { Fragment } from 'react'
import { selectOpeningTreatment } from '@lib/homeV2/compose'
import {
  HOME_V2_SECTIONS,
  HOME_V2_REVALIDATE_SECONDS
} from '@lib/homeV2/sections'
import { HoverPrefetchLink } from '@components/HoverPrefetchLink'
import { NcolAdSlot } from '@components/NcolAdSlot'
import { Container } from '@components/Container'
import { Opening } from './Opening'
import { Section, SectionHeading } from './Section'
import { RegionalFilter } from './RegionalFilter'
import { Sidebar } from './Sidebar'
import { HomeVideoModule } from './VideoModule'
import { isHomeV2PerformanceAuditEnabled } from '@lib/homeV2/preview'
import { isHomeV2PublicEnabled } from '@lib/homeV2/release'
import styles from './HomeV2.module.css'
import { formatHomeDate } from '@lib/homeV2/dates'
import { homeEditorialDay } from '@lib/homeV2/editorialPolicy'
import {
  getHomeEditorialEditions,
  type HomeEditorialEdition
} from '@lib/homeV2/editorialEditions'
import { EditorialViews } from './EditorialViews'
import { DailyBoundary, EditorialRoot } from './DailyBoundary'
import {
  SECTION_LEAD_IMAGE_SIZES,
  DIVIDED_SECTION_LEAD_IMAGE_SIZES
} from './imageSizes'

export function HomeV2({
  data,
  compareOpenings = false,
  publicRegionApi = false,
  editorialView,
  snapshotReceipt
}: {
  data: HomeV2Data
  compareOpenings?: boolean
  publicRegionApi?: boolean
  editorialView?: { now: number; editions: HomeEditorialEdition[] }
  snapshotReceipt?: string
}) {
  const now = editorialView?.now ?? Date.now()
  const day = homeEditorialDay(new Date(now))
  const editions =
    editorialView?.editions ?? getHomeEditorialEditions(data, now)
  const initial = editions[0]
  const sectionAt = (edition: HomeEditorialEdition, id: string): HomeSection =>
    edition.sections.find(section => section.id === id)!
  const regional = sectionAt(initial, 'zulia')
  const videos = sectionAt(initial, 'videos')
  const openingNodes = (
    edition: HomeEditorialEdition,
    preloadHero: boolean
  ) => {
    const treatments =
      compareOpenings && edition.data.featured
        ? (['photographic', 'traditional'] as const)
        : [undefined]
    return treatments.map((treatment, index) => (
      <Fragment key={treatment ?? 'automatic'}>
        {treatment && (
          <p className={styles.openingComparisonLabel}>
            {treatment === 'photographic'
              ? 'Portada fotográfica · revisión de diseño'
              : 'Portada tradicional · revisión de diseño'}
          </p>
        )}
        <Opening
          featured={edition.data.featured}
          secondary={sectionAt(edition, 'opening').articles}
          previewTreatment={treatment}
          heroHeading={index === 0 ? 'h1' : 'h2'}
          preloadHero={preloadHero}
        />
      </Fragment>
    ))
  }
  const grid = (ids: string[]) => (
    <div className={styles.sectionGrid}>
      {initial.sections
        .filter(section => ids.includes(section.id))
        .map((section, index) => (
          <EditorialViews
            key={section.id}
            editions={editions}
            select={edition => sectionAt(edition, section.id).articles}
            render={edition => (
              <Section
                section={sectionAt(edition, section.id)}
                imageSizes={
                  index === 0
                    ? SECTION_LEAD_IMAGE_SIZES
                    : DIVIDED_SECTION_LEAD_IMAGE_SIZES
                }
              />
            )}
          />
        ))}
    </div>
  )
  return (
    <DailyBoundary
      initialNow={now}
      deadlines={editions.slice(1).map(edition => edition.at)}
    >
      <EditorialRoot
        className={styles.home}
        data-home-snapshot={snapshotReceipt}
      >
        <Container className='px-[16px] max-md:max-w-none sm:px-[16px] md:px-7'>
          <div className={styles.layout}>
            <div className={styles.openingArea}>
              <EditorialViews
                editions={editions}
                select={edition => [
                  ...(edition.data.featured ? [edition.data.featured] : []),
                  ...sectionAt(edition, 'opening').articles
                ]}
                render={openingNodes}
              />
              <NcolAdSlot slot='article-top' className='flex justify-center' />
            </div>
            <div className={styles.main}>
              <div className={styles.beforeVideos}>
                {regional && (
                  <RegionalFilter
                    section={{
                      ...regional,
                      articles: data.sections.zulia ?? []
                    }}
                    regions={data.regions}
                    publicRegionApi={publicRegionApi}
                    initialDay={day}
                    initialCacheUntil={Math.min(
                      now + HOME_V2_REVALIDATE_SECONDS * 1000,
                      Date.parse(`${day}T00:00:00-04:00`) + 86400000
                    )}
                    serverRenderedLead={
                      selectOpeningTreatment(initial.data.featured) ===
                      'traditional'
                    }
                  />
                )}
                {grid(['nacionales', 'sucesos', 'internacionales'])}
              </div>
              {videos && videos.articles.length > 0 && (
                <HomeVideoModule
                  posts={data.sections.videos ?? []}
                  section={HOME_V2_SECTIONS.find(
                    section => section.id === 'videos'
                  )!}
                  prepareMeasurement={
                    isHomeV2PublicEnabled() || isHomeV2PerformanceAuditEnabled()
                  }
                />
              )}
              <div className={styles.afterVideos}>
                <NcolAdSlot
                  slot='footer'
                  className='flex min-w-0 justify-center [&>div]:max-w-full'
                />
                {grid(['deportes', 'tendencias', 'entretenimiento'])}
                <EditorialViews
                  editions={editions}
                  select={edition => sectionAt(edition, 'latest').articles}
                  render={edition => (
                    <section
                      className={styles.latest}
                      data-module-id='latest'
                      data-editorial-position='10'
                    >
                      <SectionHeading
                        title='Últimas publicaciones'
                        href='/lo-ultimo/'
                      />
                      <ul>
                        {sectionAt(edition, 'latest').articles.map(
                          (post, index) => (
                            <li
                              key={post.id ?? post.uri}
                              data-article-id={post.id ?? post.uri}
                              data-article-uri={post.uri}
                              data-item-position={index + 1}
                              data-component-type='text_list'
                            >
                              <time dateTime={post.date}>
                                {formatHomeDate(post.date, true) ?? '—'}
                              </time>
                              <HoverPrefetchLink href={post.uri}>
                                {post.title}
                              </HoverPrefetchLink>
                            </li>
                          )
                        )}
                      </ul>
                    </section>
                  )}
                />
              </div>
            </div>
            <Sidebar part='before-videos' />
            <Sidebar part='after-videos' />
          </div>
        </Container>
      </EditorialRoot>
    </DailyBoundary>
  )
}
