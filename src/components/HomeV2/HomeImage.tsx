'use client'

import { useState } from 'react'
import { SafeImage } from '@components/ui/safe-image'
import { getHomeImage } from '@lib/homeV2/images'
import type { HomeArticle } from '@lib/homeV2/types'
import styles from './HomeV2.module.css'

export function HomeImage({
  image,
  title,
  width = 660,
  sizes = '(min-width: 1024px) 280px, 100vw',
  critical = false
}: {
  image: HomeArticle['featuredImage']
  title: string
  width?: number
  sizes?: string
  critical?: boolean
}) {
  const [failed, setFailed] = useState(false)
  const source = getHomeImage(image, width)
  if (!source) return null
  return (
    <picture className={styles.picture}>
      {!failed && source.srcSet && (
        <source srcSet={source.srcSet} sizes={sizes} />
      )}
      <SafeImage
        key={source.src}
        src={source.src}
        alt={title}
        fill
        sizes={sizes}
        loading={critical ? 'eager' : 'lazy'}
        fetchPriority={critical ? 'high' : undefined}
        data-home-critical={critical ? 'true' : undefined}
        className={styles.image}
        onError={() => setFailed(true)}
      />
    </picture>
  )
}
