import type { HomeV2Data } from '@lib/homeV2/types'
import { Fragment } from 'react'
import {
  composeHomeSections,
  featuredArticleExpiresAt,
  isFeaturedArticle,
  selectOpeningTreatment
} from '@lib/homeV2/compose'
import { HOME_V2_SECTIONS } from '@lib/homeV2/sections'
import { HoverPrefetchLink } from '@components/HoverPrefetchLink'
import { NcolAdSlot } from '@components/NcolAdSlot'
import { Container } from '@components/Container'
import { Opening } from './Opening'
import { Section, SectionHeading } from './Section'
import { RegionalFilter } from './RegionalFilter'
import { Sidebar } from './Sidebar'
import { VideoCarousel } from '@components/VideoCarousel'
import { isHomeV2PerformanceAuditEnabled } from '@lib/homeV2/preview'
import styles from './HomeV2.module.css'
import { formatHomeDate } from '@lib/homeV2/dates'
import {
  filterHomeHeadlineDates,
  homeEditorialDay
} from '@lib/homeV2/editorialPolicy'
import { DailyBoundary } from './DailyBoundary'
import {
  SECTION_LEAD_IMAGE_SIZES,
  DIVIDED_SECTION_LEAD_IMAGE_SIZES
} from './imageSizes'

export function HomeV2({
  data,
  compareOpenings = false
}: {
  data: HomeV2Data
  compareOpenings?: boolean
}) {
  const now = Date.now()
  const day = homeEditorialDay()
  data = filterHomeHeadlineDates(data, day, now)
  const featuredDeadlines = (data.sections.opening ?? [])
    .filter(article => isFeaturedArticle(article, now))
    .map(article => featuredArticleExpiresAt(article)!)
  const sections = composeHomeSections(data, HOME_V2_SECTIONS)
  const opening = sections.find(section => section.id === 'opening')
  const regional = sections.find(section => section.id === 'zulia')
  const videos = sections.find(section => section.id === 'videos')
  const latest = sections.find(section => section.id === 'latest')
  const previewTreatments =
    compareOpenings && data.featured
      ? (['photographic', 'traditional'] as const)
      : [undefined]
  const grid = (ids: string[]) => (
    <div className={styles.sectionGrid}>
      {sections
        .filter(section => ids.includes(section.id))
        .map((section, index) => (
          <Section
            key={section.id}
            section={section}
            imageSizes={
              index === 0
                ? SECTION_LEAD_IMAGE_SIZES
                : DIVIDED_SECTION_LEAD_IMAGE_SIZES
            }
          />
        ))}
    </div>
  )
  return (
    <DailyBoundary
      day={day}
      expiresAt={
        featuredDeadlines.length ? Math.min(...featuredDeadlines) : undefined
      }
    >
      <div
        key={day}
        className={styles.home}
        data-home-variant='v2'
        data-editorial-day={day}
      >
        <Container className='px-[16px] max-md:max-w-none sm:px-[16px] md:px-7'>
          <div className={styles.layout}>
            <div className={styles.openingArea}>
              {previewTreatments.map((treatment, index) => (
                <Fragment key={treatment ?? 'automatic'}>
                  {treatment && (
                    <p className={styles.openingComparisonLabel}>
                      {treatment === 'photographic'
                        ? 'Portada fotográfica · revisión de diseño'
                        : 'Portada tradicional · revisión de diseño'}
                    </p>
                  )}
                  <Opening
                    featured={data.featured}
                    secondary={opening?.articles ?? []}
                    previewTreatment={treatment}
                    heroHeading={index === 0 ? 'h1' : 'h2'}
                  />
                </Fragment>
              ))}
              <NcolAdSlot slot='article-top' className='flex justify-center' />
            </div>
            <div className={styles.main}>
              <div className={styles.beforeVideos}>
                {regional && (
                  <RegionalFilter
                    section={regional}
                    regions={data.regions}
                    serverRenderedLead={
                      selectOpeningTreatment(data.featured) === 'traditional'
                    }
                  />
                )}
                {grid(['nacionales', 'sucesos', 'internacionales'])}
              </div>
              {videos && videos.articles.length > 0 && (
                <div className={styles.videoArea}>
                  <VideoCarousel
                    posts={videos.articles}
                    homeMeasurement
                    editorialPosition={videos.position}
                    prepareMeasurement={isHomeV2PerformanceAuditEnabled()}
                    className='-mx-[16px] mb-0 sm:-mx-[16px] md:mx-0 md:mb-0'
                  />
                </div>
              )}
              <div className={styles.afterVideos}>
                <NcolAdSlot
                  slot='footer'
                  className='flex min-w-0 justify-center [&>div]:max-w-full'
                />
                {grid(['deportes', 'tendencias', 'entretenimiento'])}
                {latest && (
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
                      {latest.articles.map((post, index) => (
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
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            </div>
            <Sidebar part='before-videos' />
            <Sidebar part='after-videos' />
          </div>
        </Container>
      </div>
    </DailyBoundary>
  )
}
