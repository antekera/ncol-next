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

const WIDE_IMAGE_THRESHOLD = 1200

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

const TodayHeroPost = ({
  id,
  title,
  uri,
  date,
  excerpt,
  featuredImage,
  categories,
  customFields
}: TodayPost) => {
  const limitedTitle = limitStringCharacters(title)
  if (!limitedTitle || limitedTitle.length <= 10) return null

  const imageWidth = featuredImage?.node?.mediaDetails?.width ?? 0
  const isWide = imageWidth >= WIDE_IMAGE_THRESHOLD

  // Wide image: full-width overlay, no horizontal padding (bleeds to container edges)
  if (isWide) {
    return (
      <article
        key={id}
        className='relative -mx-6 mb-4 overflow-hidden sm:-mx-7 sm:rounded-sm'
      >
        <div
          className='relative w-full overflow-hidden'
          style={{ maxHeight: 500 }}
        >
          <HoverPrefetchLink
            href={uri}
            aria-label={limitedTitle}
            onClick={() =>
              GAEvent({
                category: GA_EVENTS.POST_LINK.SINGLE.CATEGORY,
                label: 'TODAY_HERO_OVERLAY'
              })
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featuredImage?.node.sourceUrl ?? ''}
              srcSet={featuredImage?.node.srcSet}
              alt={limitedTitle}
              className='w-full object-cover'
              fetchPriority='high'
              loading='eager'
            />
          </HoverPrefetchLink>
          {customFields?.videodestacado && (
            <span className='bg-secondary pointer-events-none absolute top-2 right-2 z-20 rounded px-1.5 py-0.5 font-sans text-[10px] font-bold tracking-wide text-white uppercase shadow'>
              + Video
            </span>
          )}
          <div
            className='pointer-events-none absolute inset-0'
            style={{
              background:
                'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 40%, transparent 70%)'
            }}
          />
          <div className='absolute right-0 bottom-0 left-0 p-4 md:p-6'>
            {categories && (
              <CategoryLabel
                categories={categories}
                className='mb-2 text-white/90'
              />
            )}
            <h2 className='text-xl leading-snug font-bold text-white md:text-3xl'>
              <HoverPrefetchLink
                href={uri}
                onClick={() =>
                  GAEvent({
                    category: GA_EVENTS.POST_LINK.SINGLE.CATEGORY,
                    label: 'TODAY_HERO_OVERLAY'
                  })
                }
              >
                {limitedTitle}
              </HoverPrefetchLink>
            </h2>
            {excerpt && (
              <div
                className='mt-2 line-clamp-2 hidden text-sm text-white sm:block'
                dangerouslySetInnerHTML={{ __html: excerpt }}
              />
            )}
            <div className='mt-2 text-sm text-white'>
              <DateTime dateString={date} />
            </div>
          </div>
        </div>
      </article>
    )
  }

  // Smaller image: image left, text right
  return (
    <article key={id} className='mt-6 mb-4 flex flex-col gap-5 sm:flex-row'>
      {featuredImage && (
        <div className='relative w-full shrink-0 overflow-hidden sm:w-[55%]'>
          <HoverPrefetchLink
            href={uri}
            aria-label={limitedTitle}
            onClick={() =>
              GAEvent({
                category: GA_EVENTS.POST_LINK.SINGLE.CATEGORY,
                label: 'TODAY_HERO'
              })
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featuredImage.node.sourceUrl}
              srcSet={featuredImage.node.srcSet}
              alt={limitedTitle}
              className='aspect-video w-full object-cover'
              fetchPriority='high'
              loading='eager'
            />
          </HoverPrefetchLink>
          {customFields?.videodestacado && (
            <span className='bg-secondary pointer-events-none absolute top-1 right-1 z-20 rounded px-1.5 py-0.5 font-sans text-[10px] font-bold tracking-wide text-white uppercase shadow'>
              + Video
            </span>
          )}
        </div>
      )}
      <div className='flex flex-col justify-center'>
        {categories && (
          <CategoryLabel
            categories={categories}
            className='text-primary mb-1 uppercase'
          />
        )}
        <h2 className='text-xl leading-snug font-bold text-slate-900 md:text-2xl dark:text-white'>
          <HoverPrefetchLink
            href={uri}
            aria-label={limitedTitle}
            onClick={() =>
              GAEvent({
                category: GA_EVENTS.POST_LINK.SINGLE.CATEGORY,
                label: 'TODAY_HERO'
              })
            }
          >
            {limitedTitle}
          </HoverPrefetchLink>
        </h2>
        {excerpt && (
          <div
            className='mt-2 line-clamp-3 text-sm text-slate-600 dark:text-neutral-300'
            dangerouslySetInnerHTML={{ __html: excerpt }}
          />
        )}
        <div className='mt-2 text-sm text-slate-500 dark:text-neutral-400'>
          <DateTime dateString={date} />
        </div>
      </div>
    </article>
  )
}

export { TodayHeroPost }
