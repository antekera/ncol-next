'use client'

import { useEffect, useRef } from 'react'

import { ChevronRight, ChevronLeft } from 'lucide-react'

import { CategoryArticle } from '@components/CategoryArticle'
import { RECENT_NEWS } from '@lib/constants'
import { PostsCategoryQueried } from '@lib/types'

const RelatedPostsByCategory = ({
  posts
}: {
  posts: PostsCategoryQueried['edges']
}) => {
  const slidesContainerRef = useRef<HTMLDivElement>(null)
  const prevButtonRef = useRef<HTMLButtonElement>(null)
  const nextButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const slideWidth =
      slidesContainerRef.current?.querySelector('.slide')?.clientWidth ?? 0
    const gap = 12
    const handleNextClick = () => {
      if (slidesContainerRef.current) {
        slidesContainerRef.current.scrollLeft += slideWidth + gap
      }
    }

    const handlePrevClick = () => {
      if (slidesContainerRef.current) {
        slidesContainerRef.current.scrollLeft -= slideWidth + gap
      }
    }

    const prevButton = prevButtonRef.current
    const nextButton = nextButtonRef.current

    if (nextButton && prevButton) {
      nextButton.addEventListener('click', handleNextClick)
      prevButton.addEventListener('click', handlePrevClick)
    }

    return () => {
      // Cleanup event listeners when component unmounts
      if (nextButton && prevButton) {
        nextButton.removeEventListener('click', handleNextClick)
        prevButton.removeEventListener('click', handlePrevClick)
      }
    }
  }, [])

  return (
    <div className='border-t border-slate-300 bg-white pt-2 md:hidden'>
      <h5 className='link-post-category border-primary bg-primary relative ml-7 inline-block rounded-sm px-1 pt-1 pb-[3px] font-sans text-xs leading-none text-white uppercase'>
        {RECENT_NEWS}
      </h5>
      <div
        ref={slidesContainerRef}
        className='slides-container flex snap-x snap-mandatory flex-nowrap space-x-3 overflow-hidden overflow-x-auto scroll-smooth rounded-sm before:w-7 before:shrink-0 after:w-7 after:shrink-0 md:hidden'
      >
        {posts?.map(({ node }, index) => (
          <div key={node.id} className='slide w-48 flex-none pt-2'>
            <CategoryArticle
              type='recent_news'
              {...node}
              isFirst={index === 0}
              isLast={index + 1 === posts.length}
            />
          </div>
        ))}
      </div>
      <div className='absolute top-12 left-2 z-40 h-full items-center md:flex'>
        <button
          ref={prevButtonRef}
          className='prev group h-10 w-10 rounded-full bg-slate-500 text-neutral-900'
          aria-label='prev'
        >
          <ChevronLeft
            size={28}
            className='pointer-events-none relative left-1 text-white transition-all duration-200 ease-linear group-active:-translate-x-1'
          />
        </button>
      </div>
      <div className='absolute top-12 right-2 z-40 h-full items-center md:flex'>
        <button
          ref={nextButtonRef}
          className='prev group h-10 w-10 rounded-full bg-slate-500 text-neutral-900'
          aria-label='next'
        >
          <ChevronRight
            size={28}
            className='pointer-events-none relative -right-2 text-white transition-all duration-200 ease-linear group-active:translate-x-1'
          />
        </button>
      </div>
    </div>
  )
}

export { RelatedPostsByCategory }
