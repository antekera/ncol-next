'use client'

import Link from 'next/link'
import { CoverImage } from '@components/CoverImage'
import { PostCategories } from '@components/PostCategories'
import { PostsFetcherProps } from '@lib/types'
import { GAEvent } from '@lib/utils/ga'
import { DateTime } from '@components/DateTime'
import { Excerpt } from '@components/Excerpt'
import { useHeroPosts } from '@lib/hooks/data/useHeroPosts'
import { processHomePosts } from '@lib/utils/processHomePosts'
import { CoverPostSkeleton } from '@components/LoadingHome'
import ContextStateData from '@lib/context/StateContext'
import { useCallback, useEffect } from 'react'
import { MostVisitedPosts } from '@components/MostVisitedPosts'
import { useIsMobile } from '@lib/hooks/useIsMobile'
import { GA_EVENTS } from '@lib/constants'

const PostHero = ({ qty, slug }: Pick<PostsFetcherProps, 'qty' | 'slug'>) => {
  const { handleSetContext } = ContextStateData()
  const { data, isLoading } = useHeroPosts({
    slug,
    qty,
    offset: 0
  })
  const isMobile = useIsMobile()

  const getCover = useCallback(() => processHomePosts(data), [data])
  const { cover } = getCover()
  const { featuredImage, uri, title, excerpt, date, categories } = cover ?? {}

  useEffect(() => {
    handleSetContext({
      coverSlug: cover?.uri ?? ''
    })
  }, [cover, handleSetContext])

  if (isLoading) {
    return <CoverPostSkeleton />
  }

  if (!cover || !data) {
    return null
  }

  return (
    <section className='post-hero'>
      {featuredImage && title && (
        <div className='post-hero-image-wrapper'>
          <CoverImage
            className='post-hero-image'
            priority={true}
            uri={uri}
            title={title}
            coverImage={featuredImage?.node?.sourceUrl}
            srcSet={featuredImage?.node?.srcSet}
            size={isMobile ? 'sm' : 'lg'}
          />
        </div>
      )}
      <div className='post-hero-content'>
        {categories && (
          <PostCategories
            slice={2}
            className='post-hero-categories'
            {...categories}
          />
        )}
        {uri && (
          <h1 className='post-hero-title'>
            <Link
              href={uri}
              className='post-hero-title-link'
              aria-label={title}
              onClick={() =>
                GAEvent({
                  category: GA_EVENTS.POST_LINK.COVER.CATEGORY,
                  label: GA_EVENTS.POST_LINK.COVER.LABEL
                })
              }
            >
              {title}
            </Link>
          </h1>
        )}
        <hr className='post-hero-separator' />
        <div className='post-hero-meta'>
          <Excerpt className='post-hero-excerpt' text={excerpt} />
          <DateTime dateString={date} />
        </div>
      </div>
      {/* <div className='mb-6 md:ml-6'>
        <AdSenseBanner {...ad.home.cover} />
      </div> */}
      {isMobile && (
        <div className='post-hero-most-visited'>
          <MostVisitedPosts className='sidebar-most-visited' />
        </div>
      )}
    </section>
  )
}

export { PostHero }