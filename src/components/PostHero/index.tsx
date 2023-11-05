import Link from 'next/link'

import { AdDfpSlot } from '@components/AdDfpSlot'
import { CoverImage } from '@components/CoverImage'
import { DateTime } from '@components/DateTime'
import { Excerpt } from '@components/Excerpt'
import { PostCategories } from '@components/PostCategories'
import { PostHome } from '@lib/types'
import { GAEvent } from '@lib/utils/ga'

const PostHero = ({
  title,
  uri,
  date,
  excerpt,
  featuredImage,
  categories,
  adId
}: PostHome): JSX.Element => {
  return (
    <section>
      {featuredImage && (
        <div className='relative w-auto h-48 -mx-6 sm:w-full sm:mx-0 sm:h-64 lg:h-72 z-1'>
          <CoverImage
            className='relative block w-full h-48 sm:h-60 md:h-60 lg:h-72'
            priority={true}
            uri={uri}
            title={title}
            coverImage={featuredImage?.node?.sourceUrl}
          />
        </div>
      )}
      <div className='relative w-auto px-5 py-2 -mt-10 -ml-6 bg-white border-t-4 sm:ml-0 sm:w-11/12 content border-primary z-2'>
        {categories && (
          <PostCategories
            slice={2}
            className='mb-3 uppercase text-primary'
            {...categories}
          />
        )}
        <h1 className='mb-2 font-serif text-2xl font-bold leading-tight lg:text-4xl text-slate-900'>
          <Link
            href={uri}
            className='hover:text-primary'
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
        <hr className='relative w-48 mt-4 mb-3 md:w-80 text-slate-200' />
        <div className='mb-4 text-xs md:mb-0 font-sans'>
          <Excerpt className='mb-2 md:text-lg' text={excerpt} />
          <DateTime dateString={date} />
        </div>
      </div>
      <AdDfpSlot className='pt-2 pb-6 bloque-adv-list' id={adId} />
    </section>
  )
}

export { PostHero }
