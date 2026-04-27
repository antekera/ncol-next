'use client'

import Image from 'next/image'
import { TodayPost } from '@app/actions/getTodayYesterdayPosts'
import { DateTime } from '@components/DateTime'
import { HoverPrefetchLink } from '@components/HoverPrefetchLink'
import { TodayCategoryLabel } from '@components/TodayCategoryLabel'
import { GAEvent } from '@lib/utils/ga'
import { GA_EVENTS } from '@lib/constants'
import { limitStringCharacters } from '@lib/utils/limitStringCharacters'

const TodayNewsCard = ({
  title,
  uri,
  date,
  featuredImage,
  categories,
  customFields
}: TodayPost) => {
  const limitedTitle = limitStringCharacters(title)
  if (!limitedTitle || limitedTitle.length <= 10) return null

  return (
    <article className='flex flex-col'>
      <HoverPrefetchLink
        href={uri}
        aria-label={limitedTitle}
        className='block'
        onClick={() =>
          GAEvent({
            category: GA_EVENTS.POST_LINK.SINGLE.CATEGORY,
            label: 'TODAY_NEWS_CARD'
          })
        }
      >
        {featuredImage && (
          <div className='relative mb-3 w-full overflow-hidden pb-[56.25%]'>
            <Image
              src={featuredImage.node.sourceUrl}
              alt={limitedTitle}
              fill
              className='object-cover'
              sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
            />
            {customFields?.videodestacado && (
              <span className='bg-secondary pointer-events-none absolute top-1 right-1 z-20 rounded px-1.5 py-0.5 font-sans text-[10px] font-bold tracking-wide text-white uppercase shadow'>
                + Video
              </span>
            )}
          </div>
        )}
      </HoverPrefetchLink>
      {categories && (
        <TodayCategoryLabel
          categories={categories}
          className='text-primary pt-1 pb-2 uppercase'
        />
      )}
      <h3 className='text-base leading-snug font-semibold text-slate-900 dark:text-white'>
        <HoverPrefetchLink
          href={uri}
          aria-label={limitedTitle}
          onClick={() =>
            GAEvent({
              category: GA_EVENTS.POST_LINK.SINGLE.CATEGORY,
              label: 'TODAY_NEWS_CARD'
            })
          }
        >
          {limitedTitle}
        </HoverPrefetchLink>
      </h3>
      <div className='mt-2 text-xs text-slate-500 dark:text-neutral-400'>
        <DateTime dateString={date} />
      </div>
    </article>
  )
}

export { TodayNewsCard }
