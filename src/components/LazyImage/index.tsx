'use client'

import { useInView } from 'react-intersection-observer'
import { CoverImage } from '@components/CoverImage'
import type { CoverImageProps } from '@components/CoverImage'
import { Skeleton } from '@components/ui/skeleton'

const LazyImage = (props: CoverImageProps) => {
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true
  })

  return (
    <div ref={ref} className='min-h-[200px]'>
      {inView ? (
        <CoverImage {...props} />
      ) : (
        <Skeleton className='h-32 w-full' />
      )}
    </div>
  )
}

export { LazyImage }
