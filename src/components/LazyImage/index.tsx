'use client'

import { useInView } from 'react-intersection-observer'
import { CoverImage } from '@components/CoverImage'
import type { CoverImageProps } from '@lib/types'
import { Skeleton } from '@components/ui/skeleton'

const LazyImage = (props: CoverImageProps) => {
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true
  })

  return (
    <div ref={ref}>
      {inView ? (
        <CoverImage {...props} />
      ) : (
        <Skeleton className='lazy-image-skeleton' />
      )}
    </div>
  )
}

export { LazyImage }