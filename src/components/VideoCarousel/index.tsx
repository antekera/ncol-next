'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Video } from 'lucide-react'
import { VideoCard } from '@components/VideoCard'
import { useInView } from 'react-intersection-observer'
import { useVideoPosts } from '@lib/hooks/data/useVideoPosts'

export const VideoCarouselSkeleton = () => {
  return (
    <div className='relative -mx-6 mb-8 animate-pulse rounded-none border-x-0 border-y border-slate-800 bg-slate-950 px-0 py-4 sm:mx-0 sm:rounded-2xl sm:border sm:px-6 sm:py-6 md:mr-2 md:ml-5'>
      <div className='mb-6 flex items-center justify-between px-6 sm:px-0'>
        <div className='flex items-center gap-2.5'>
          <div className='h-9 w-9 rounded-lg bg-slate-800' />
          <div>
            <div className='h-5 w-40 rounded bg-slate-800' />
            <div className='mt-2 h-0.5 w-16 bg-slate-800' />
          </div>
        </div>
      </div>
      <div className='no-scrollbar mobile-centered-carousel flex gap-4 overflow-hidden'>
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className='w-[290px] flex-none space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:w-[350px]'
          >
            <div className='aspect-video w-full rounded bg-slate-800' />
            <div className='space-y-2'>
              <div className='h-3.5 w-16 rounded bg-slate-800' />
              <div className='h-4 w-3/4 rounded bg-slate-800' />
              <div className='h-4 w-1/2 rounded bg-slate-800' />
            </div>
            <div className='mt-4 h-6 w-full rounded bg-slate-800/50' />
          </div>
        ))}
      </div>
    </div>
  )
}

export const VideoCarousel = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px'
  })

  const { posts, isLoading } = useVideoPosts({ enabled: inView })

  const containerRef = useRef<HTMLDivElement>(null)
  const [isScrollable, setIsScrollable] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
      setIsScrollable(scrollWidth > clientWidth + 5)
      setCanScrollLeft(scrollLeft > 5)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5)
    }
  }

  useEffect(() => {
    const el = containerRef.current
    if (el) {
      const timer = setTimeout(() => {
        checkScroll()
      }, 100)
      el.addEventListener('scroll', checkScroll, { passive: true })
      window.addEventListener('resize', checkScroll)
      return () => {
        clearTimeout(timer)
        el.removeEventListener('scroll', checkScroll)
        window.removeEventListener('resize', checkScroll)
      }
    }
  }, [posts])

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const { clientWidth } = containerRef.current
      const scrollAmount = clientWidth * 0.8
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  if (!inView || isLoading) {
    return (
      <div ref={ref}>
        <VideoCarouselSkeleton />
      </div>
    )
  }

  if (posts.length === 0) {
    return null
  }

  return (
    <section
      ref={ref}
      className='relative -mx-6 mb-8 overflow-hidden rounded-none border-x-0 border-y border-slate-800 bg-slate-950 px-0 py-4 shadow-xl sm:mx-0 sm:rounded-2xl sm:border sm:px-6 sm:py-6 md:mr-2 md:ml-5'
    >
      {/* Decorative gradient overlay */}
      <div className='bg-primary/10 absolute -top-24 -left-24 h-48 w-48 rounded-full blur-3xl' />
      <div className='bg-secondary/10 absolute -right-24 -bottom-24 h-48 w-48 rounded-full blur-3xl' />

      {/* Header */}
      <div className='relative z-10 mb-6 flex items-center justify-between px-6 sm:px-0'>
        <div className='flex items-center gap-2.5'>
          <div className='from-primary to-secondary flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow'>
            <Video className='h-5 w-5' />
          </div>
          <div>
            <h3 className='font-sans text-lg font-bold tracking-tight text-white uppercase sm:text-xl'>
              Videos Recientes
            </h3>
            <div className='from-primary to-secondary mt-1 h-0.5 w-16 rounded-full bg-gradient-to-r' />
          </div>
        </div>

        {/* Carousel controls */}
        {posts.length > 1 && isScrollable && (
          <div className='flex items-center gap-2'>
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`flex h-8 w-8 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-300 transition-all ${
                canScrollLeft
                  ? 'cursor-pointer hover:bg-slate-800 hover:text-white'
                  : 'cursor-not-allowed opacity-40'
              }`}
              aria-label='Scroll left'
            >
              <ChevronLeft className='h-5 w-5' />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`flex h-8 w-8 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-300 transition-all ${
                canScrollRight
                  ? 'cursor-pointer hover:bg-slate-800 hover:text-white'
                  : 'cursor-not-allowed opacity-40'
              }`}
              aria-label='Scroll right'
            >
              <ChevronRight className='h-5 w-5' />
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Container with cards */}
      <div className='relative z-10'>
        <div
          ref={containerRef}
          className='no-scrollbar scrolling-touch mobile-centered-carousel flex snap-x snap-mandatory flex-nowrap gap-4 overflow-x-auto scroll-smooth pb-2'
        >
          {posts.map(post => (
            <div key={post.id} className='snap-center sm:snap-start'>
              <VideoCard
                node={post}
                className='w-[290px] flex-none sm:w-[350px]'
              />
            </div>
          ))}
        </div>

        {/* Side fade overlays to indicate more videos */}
        {canScrollLeft && (
          <div className='pointer-events-none absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-slate-950 to-transparent' />
        )}
        {canScrollRight && (
          <div className='pointer-events-none absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-slate-950 to-transparent' />
        )}
      </div>
    </section>
  )
}
