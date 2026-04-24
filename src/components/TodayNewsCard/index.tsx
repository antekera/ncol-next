'use client'

import { TodayPost } from '@app/actions/getTodayYesterdayPosts'
import { DateTime } from '@components/DateTime'
import { HoverPrefetchLink } from '@components/HoverPrefetchLink'
import { getPostCategoriesClasses } from '@components/PostCategories/styles'
import { processCategories } from '@lib/utils/processCategories'
import { GAEvent } from '@lib/utils/ga'
import { GA_EVENTS, CATEGORY_PATH } from '@lib/constants'
import { limitStringCharacters } from '@lib/utils/limitStringCharacters'
import Link from 'next/link'

const CategoryLabel = ({
  categories,
  className
}: {
  categories: TodayPost['categories']
  className?: string
}) => {
  const processed = processCategories(categories.edges, 1)
  if (!processed.length) return null
  const cat = processed[0]?.node
  const classes = getPostCategoriesClasses(className)
  if (!cat) return null
  return (
    <Link href={`${CATEGORY_PATH}/${cat.slug}`} className={classes}>
      {cat.name}
    </Link>
  )
}

const TodayNewsCard = ({
  id,
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
    <article key={id} className='flex flex-col'>
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
        {featuredImage && (
          <div
            className='relative mb-3 w-full'
            style={{ aspectRatio: '16/9', overflow: 'hidden' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featuredImage.node.sourceUrl}
              alt={limitedTitle}
              className='h-full w-full object-cover'
              loading='lazy'
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
        <CategoryLabel
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
