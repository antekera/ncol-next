'use client'

import { useState } from 'react'
import { getImageProps } from 'next/image'
import { preload } from 'react-dom'
import { useInView } from 'react-intersection-observer'
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
  const [failedSource, setFailedSource] = useState<string | null>(null)
  const { ref, inView } = useInView({
    rootMargin: '200px 0px',
    triggerOnce: true,
    skip: critical,
    // Loading fallback only; impression measurement has its own strict observer.
    fallbackInView: true
  })
  const source = getHomeImage(image, width)
  if (!source) return null
  // Keep legacy CDN behavior elsewhere. The critical V2 original is encoded
  // by the existing Next optimizer, with the same candidates in hint and picture.
  const optimizeCdn =
    critical && source.src.startsWith('https://cdn.noticiascol.com/')
  const responsive = optimizeCdn
    ? getImageProps({ src: source.src, alt: title, fill: true, sizes }).props
    : source
  const failed = failedSource === source.src
  const load = critical || inView
  // React skips automatic image hints inside picture. Match its responsive
  // source exactly; without srcSet let SafeImage own the optimizer URL.
  if (critical && !failed && responsive.srcSet)
    preload(responsive.src, {
      as: 'image',
      imageSrcSet: responsive.srcSet,
      imageSizes: sizes,
      fetchPriority: 'high'
    })
  return (
    <picture ref={ref} className={styles.picture}>
      {load && !failed && responsive.srcSet && (
        <source srcSet={responsive.srcSet} sizes={sizes} />
      )}
      {load && (
        <SafeImage
          key={source.src}
          src={source.src}
          optimizeCdn={optimizeCdn}
          alt={title}
          fill
          sizes={sizes}
          loading={critical ? 'eager' : 'lazy'}
          fetchPriority={critical ? 'high' : undefined}
          data-home-critical={critical ? 'true' : undefined}
          className={styles.image}
          onError={() => setFailedSource(source.src)}
        />
      )}
    </picture>
  )
}
