'use client'

import { lazy, Suspense, type ComponentProps } from 'react'
import { useInView } from 'react-intersection-observer'
import { VideoCarouselSkeleton } from './Skeleton'

export { VideoCarouselSkeleton } from './Skeleton'

const DeferredCarousel = lazy(() =>
  import('./Carousel').then(module => ({
    default: module.VideoCarouselContent
  }))
)

type VideoCarouselProps = ComponentProps<typeof DeferredCarousel>

export function VideoCarousel(props: VideoCarouselProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px'
  })
  return (
    <div ref={ref}>
      <Suspense
        fallback={<VideoCarouselSkeleton className={props.className} />}
      >
        {inView ? (
          <DeferredCarousel {...props} />
        ) : (
          <VideoCarouselSkeleton className={props.className} />
        )}
      </Suspense>
    </div>
  )
}
