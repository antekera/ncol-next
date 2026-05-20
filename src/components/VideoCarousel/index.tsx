'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight, Video } from 'lucide-react'
import { PostHome } from '@lib/types'
import { VideoPlayer } from '@components/VideoPlayer'
import { HoverPrefetchLink } from '@components/HoverPrefetchLink'
import { useInView } from 'react-intersection-observer'
import { useVideoPosts } from '@lib/hooks/data/useVideoPosts'
import { getCategoryNode } from '@lib/utils/getCategoryNode'
import { CATEGORY_PATH, GA_EVENTS } from '@lib/constants'
import { GAEvent } from '@lib/utils/ga'

const VideoCard = ({ node }: { node: PostHome }) => {
  const category = getCategoryNode(node.categories)
  const categoryName = category?.name || 'Video'
  const categorySlug = category?.slug
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const handleBlur = () => {
      if (document.activeElement === iframeRef.current) {
        GAEvent({
          action: GA_EVENTS.VIDEO_WIDGET.PLAY_VIDEO,
          category: GA_EVENTS.VIDEO_WIDGET.CATEGORY,
          label: node.customFields?.videodestacado || ''
        })
      }
    }

    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('blur', handleBlur)
    }
  }, [node])

  return (
    <div className='group relative flex w-[290px] flex-none flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 text-white shadow-lg transition-all duration-300 hover:border-slate-700 hover:shadow-2xl sm:w-[350px]'>
      {/* Video Container */}
      <div className='relative aspect-video w-full shrink-0 overflow-hidden bg-black'>
        <VideoPlayer
          url={node.customFields?.videodestacado || ''}
          iframeRef={iframeRef}
          className='!mb-0 h-full w-full rounded-none'
        />
      </div>

      {/* Info Container */}
      <div className='flex flex-1 flex-col justify-between bg-gradient-to-b from-slate-900 to-slate-950 p-4'>
        <div className='space-y-1.5'>
          {categoryName &&
            (categorySlug ? (
              <HoverPrefetchLink
                href={`${CATEGORY_PATH}/${categorySlug}`}
                className='text-secondary font-sans text-[10px] font-bold tracking-wider uppercase transition-colors hover:text-slate-200'
                onClick={() =>
                  GAEvent({
                    action: GA_EVENTS.VIDEO_WIDGET.CLICK_CATEGORY_LINK,
                    category: GA_EVENTS.VIDEO_WIDGET.CATEGORY,
                    label: categorySlug
                  })
                }
              >
                {categoryName}
              </HoverPrefetchLink>
            ) : (
              <span className='text-secondary font-sans text-[10px] font-bold tracking-wider uppercase'>
                {categoryName}
              </span>
            ))}
          <h4 className='line-clamp-2 text-sm leading-snug font-bold text-slate-100 transition-colors group-hover:text-sky-400 sm:text-base'>
            <HoverPrefetchLink
              href={node.uri}
              onClick={() =>
                GAEvent({
                  action: GA_EVENTS.VIDEO_WIDGET.CLICK_POST_LINK,
                  category: GA_EVENTS.VIDEO_WIDGET.CATEGORY,
                  label: node.uri
                })
              }
            >
              {node.title}
            </HoverPrefetchLink>
          </h4>
        </div>

        <div className='mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3'>
          <span className='font-sans text-[10px] text-slate-300'>
            {node.date
              ? new Date(node.date).toLocaleDateString('es-VE', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })
              : ''}
          </span>
          <HoverPrefetchLink
            href={node.uri}
            className='flex items-center gap-1 font-sans text-xs font-semibold text-sky-400 transition-colors hover:text-sky-300'
            onClick={() =>
              GAEvent({
                action: GA_EVENTS.VIDEO_WIDGET.CLICK_VIEW_NEWS,
                category: GA_EVENTS.VIDEO_WIDGET.CATEGORY,
                label: node.uri
              })
            }
          >
            Ver noticia
            <ArrowRight className='h-3.5 w-3.5' />
          </HoverPrefetchLink>
        </div>
      </div>
    </div>
  )
}

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
      <div className='no-scrollbar flex gap-4 overflow-hidden px-6 sm:px-0'>
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
          className='no-scrollbar scrolling-touch flex snap-x snap-mandatory flex-nowrap gap-4 overflow-x-auto scroll-smooth px-6 pb-2 sm:px-0'
        >
          {posts.map(post => (
            <div key={post.id} className='snap-start'>
              <VideoCard node={post} />
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
