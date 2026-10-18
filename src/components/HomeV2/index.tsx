import type { HomeV2Data } from '@lib/homeV2/types'
import {
  composeHomeSections,
  selectOpeningTreatment
} from '@lib/homeV2/compose'
import { HOME_V2_SECTIONS } from '@lib/homeV2/sections'
import { HoverPrefetchLink } from '@components/HoverPrefetchLink'
import { NcolAdSlot } from '@components/NcolAdSlot'
import { Opening } from './Opening'
import { Section, SectionHeading } from './Section'
import { RegionalFilter } from './RegionalFilter'
import { Sidebar } from './Sidebar'
import { VideoCarousel } from '@components/VideoCarousel'
import { isHomeV2PerformanceAuditEnabled } from '@lib/homeV2/preview'
import styles from './HomeV2.module.css'
import { formatHomeDate } from '@lib/homeV2/dates'
import {
  SECTION_LEAD_IMAGE_SIZES,
  DIVIDED_SECTION_LEAD_IMAGE_SIZES
} from './imageSizes'

export function HomeV2({ data }: { data: HomeV2Data }) {
  const sections = composeHomeSections(data, HOME_V2_SECTIONS)
  const opening = sections.find(section => section.id === 'opening')
  const regional = sections.find(section => section.id === 'zulia')
  const videos = sections.find(section => section.id === 'videos')
  const latest = sections.find(section => section.id === 'latest')
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
    <div className={styles.home} data-home-variant='v2'>
      <div className={styles.layout}>
        <div className={styles.openingArea}>
          <Opening
            featured={data.featured}
            secondary={opening?.articles ?? []}
          />
          <NcolAdSlot slot='article-top' className='my-4 flex justify-center' />
        </div>
        <div className={styles.main}>
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
          {videos && (
            <VideoCarousel
              posts={videos.articles}
              homeMeasurement
              editorialPosition={videos.position}
              prepareMeasurement={isHomeV2PerformanceAuditEnabled()}
              className='-mx-[16px] sm:-mx-[16px] md:mx-0'
            />
          )}
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
        <Sidebar />
      </div>
    </div>
  )
}
