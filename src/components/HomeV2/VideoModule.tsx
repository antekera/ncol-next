'use client'

import { useMemo } from 'react'
import { VideoCarousel } from '@components/VideoCarousel'
import type { HomeArticle, HomeSectionConfig } from '@lib/homeV2/types'
import { composeHomeSections } from '@lib/homeV2/compose'
import { isHeadlineCurrent } from '@lib/homeV2/editorialPolicy'
import { useEditorialDay } from './DailyBoundary'
import styles from './HomeV2.module.css'

export function HomeVideoModule({
  posts,
  section,
  prepareMeasurement
}: {
  posts: HomeArticle[]
  section: HomeSectionConfig
  prepareMeasurement: boolean
}) {
  const day = useEditorialDay()
  const visible = useMemo(
    () =>
      composeHomeSections(
        {
          featured: null,
          regions: [],
          errors: [],
          sections: {
            [section.id]: posts.filter(post => isHeadlineCurrent(post, day))
          }
        },
        [section]
      )[0].articles,
    [posts, section, day]
  )
  if (!visible.length) return null
  return (
    <div className={styles.videoArea}>
      <VideoCarousel
        posts={visible}
        homeMeasurement
        editorialPosition={section.position}
        prepareMeasurement={prepareMeasurement}
        className='-mx-[16px] mb-0 sm:-mx-[16px] md:mx-0 md:mb-0'
      />
    </div>
  )
}
