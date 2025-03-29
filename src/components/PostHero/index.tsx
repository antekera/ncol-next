'use client'

import Link from 'next/link'
import { AdSenseBanner } from '@components/AdSenseBanner'
import { CoverImage } from '@components/CoverImage'
import { DateTime } from '@components/DateTime'
import { Excerpt } from '@components/Excerpt'
import { PostCategories } from '@components/PostCategories'
import { ad } from '@lib/ads'
import { PostHome } from '@lib/types'
import { GAEvent } from '@lib/utils/ga'
import { limitStringCharacters } from '@lib/utils/limitStringCharacters'

const PostHero = ({
  categories,
  date,
  excerpt,
  featuredImage,
  title,
  uri
}: PostHome) => {
  const limitedTitle = limitStringCharacters(title)
  return (
    <section>
      {featuredImage && (
        <div className='relative z-1 -mx-6 h-48 w-auto sm:mx-0 sm:h-64 sm:w-full lg:h-72'>
          <CoverImage
            className='relative block h-48 w-full sm:h-60 md:h-60 lg:h-72'
            priority={true}
            uri={uri}
            title={limitedTitle}
            coverImage={featuredImage?.node?.sourceUrl}
          />
        </div>
      )}
      <div className='content border-primary relative z-2 -mt-10 -ml-6 w-auto border-t-4 bg-white px-5 py-2 sm:ml-0 sm:w-11/12'>
        {categories && (
          <PostCategories
            slice={2}
            className='text-primary mb-3 uppercase'
            {...categories}
          />
        )}
        <h1 className='mb-2 font-serif text-2xl leading-8 font-bold text-slate-900 lg:text-4xl lg:leading-11'>
          <Link
            href={uri}
            className='hover:text-primary'
            aria-label={limitedTitle}
            onClick={() =>
              GAEvent({
                category: 'COVER',
                label: 'COVER_TITLE'
              })
            }
          >
            {limitedTitle}
          </Link>
        </h1>
        <hr className='relative mt-4 mb-3 w-full text-slate-200 sm:w-48 md:w-80' />
        <div className='mb-4 font-sans text-xs md:mb-0'>
          <Excerpt className='mb-2' text={excerpt} />
          <DateTime dateString={date} />
        </div>
      </div>
      <AdSenseBanner className='my-4 md:pl-6' {...ad.home.cover} />
    </section>
  )
}

export { PostHero }
