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

const PostHero = ({ qty, slug }: Pick<PostsFetcherProps, 'qty' | 'slug'>) => {
  const { data, isLoading } = useHeroPosts({
    slug,
    qty,
    offset: 0
  })

  const { cover } = processHomePosts(data)
  const { featuredImage, uri, title, excerpt, date, categories } = cover ?? {}

  if (isLoading) {
    return <CoverPostSkeleton />
  }

  if (!cover || !data) {
    return null
  }

  return (
    <section className='mb-4'>
      {featuredImage && title && (
        <div className='relative z-1 -mx-6 -mb-12 h-48 w-auto sm:mx-0 sm:h-64 sm:w-full lg:h-72'>
          <CoverImage
            className='relative block h-48 w-full sm:h-60 md:h-60 lg:h-72'
            priority={true}
            uri={uri}
            title={title}
            coverImage={featuredImage?.node?.sourceUrl}
          />
        </div>
      )}
      <div className='content border-primary relative z-2 -ml-6 w-auto border-t-4 bg-white px-5 py-4 sm:ml-0 sm:w-11/12 dark:bg-neutral-800'>
        {categories && (
          <PostCategories
            slice={2}
            className='dark:text-secondary text-primary mb-3 uppercase'
            {...categories}
          />
        )}
        {uri && (
          <h1 className='mb-2 font-serif text-2xl leading-8 font-bold text-slate-900 lg:text-4xl lg:leading-11 dark:text-slate-100'>
            <Link
              href={uri}
              className='hover:text-primary dark:text-slate-200'
              aria-label={title}
              onClick={() =>
                GAEvent({
                  category: 'COVER',
                  label: 'COVER_TITLE'
                })
              }
            >
              {title}
            </Link>
          </h1>
        )}
        <hr className='relative mt-4 mb-3 w-full text-slate-200 sm:w-48 md:w-80 dark:border-neutral-500' />
        <div className='mb-4 font-sans text-xs md:mb-0'>
          <Excerpt className='mb-2' text={excerpt} />
          <DateTime dateString={date} />
        </div>
      </div>
      {/* <div className='mb-6 md:ml-6'>
        <AdSenseBanner {...ad.home.cover} />
      </div> */}
    </section>
  )
}

export { PostHero }
