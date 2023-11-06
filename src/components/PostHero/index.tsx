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
        <div className='z-1 relative -mx-6 h-48 w-auto sm:mx-0 sm:h-64 sm:w-full lg:h-72'>
          <CoverImage
            className='relative block h-48 w-full sm:h-60 md:h-60 lg:h-72'
            priority={true}
            uri={uri}
            title={title}
            coverImage={featuredImage?.node?.sourceUrl}
          />
        </div>
      )}
      <div className='content z-2 relative -ml-6 -mt-10 w-auto border-t-4 border-primary bg-white px-5 py-2 sm:ml-0 sm:w-11/12'>
        {categories && (
          <PostCategories
            slice={2}
            className='mb-3 uppercase text-primary'
            {...categories}
          />
        )}
        <h1 className='font-serif mb-2 text-2xl font-bold leading-tight text-slate-900 lg:text-4xl'>
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
        <hr className='relative mb-3 mt-4 w-48 text-slate-200 md:w-80' />
        <div className='mb-4 font-sans text-xs md:mb-0'>
          <Excerpt className='mb-2 md:text-lg' text={excerpt} />
          <DateTime dateString={date} />
        </div>
      </div>
      <AdDfpSlot className='bloque-adv-list pb-6 pt-2' id={adId} />
    </section>
  )
}

export { PostHero }
