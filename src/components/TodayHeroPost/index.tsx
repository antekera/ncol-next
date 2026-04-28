'use client'

import Image from 'next/image'
import { TodayPost } from '@app/actions/getTodayYesterdayPosts'
import { DateTime } from '@components/DateTime'
import { HoverPrefetchLink } from '@components/HoverPrefetchLink'
import { TodayCategoryLabel } from '@components/TodayCategoryLabel'
import { GAEvent } from '@lib/utils/ga'
import { GA_EVENTS } from '@lib/constants'
import { limitStringCharacters } from '@lib/utils/limitStringCharacters'

const WIDE_IMAGE_THRESHOLD = 1200

const TodayHeroPost = ({
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
      <article className='relative -mx-6 mb-4 overflow-hidden sm:-mx-7 sm:mx-0 sm:rounded-sm'>
        <div className='relative max-h-[260px] w-full overflow-hidden sm:max-h-[500px]'>
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
            <Image
              src={featuredImage?.node.sourceUrl ?? ''}
              alt={limitedTitle}
              width={featuredImage?.node?.mediaDetails?.width ?? 1200}
              height={featuredImage?.node?.mediaDetails?.height ?? 675}
              className='max-h-[260px] w-full object-cover sm:max-h-[500px]'
              priority
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
              <TodayCategoryLabel
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
    <article className='mt-6 mb-4 flex flex-col gap-5 sm:flex-row'>
      {featuredImage && (
        <div className='relative max-h-[260px] w-full shrink-0 overflow-hidden sm:max-h-[400px] sm:w-[55%]'>
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
            <Image
              src={featuredImage.node.sourceUrl}
              alt={limitedTitle}
              width={featuredImage.node.mediaDetails?.width ?? 800}
              height={featuredImage.node.mediaDetails?.height ?? 450}
              className='aspect-video w-full object-cover'
              priority
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
          <TodayCategoryLabel
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
