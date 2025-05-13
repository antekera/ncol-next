'use client'

import { CategoryArticleProps } from 'lib/types'
import Link from 'next/link'
import { DateTime } from '@components/DateTime'
import { PostCategories } from '@components/PostCategories'
import { cn } from '@lib/shared'
import { GAEvent } from '@lib/utils/ga'
import { limitStringCharacters } from '@lib/utils/limitStringCharacters'
import { LazyImage } from '@components/LazyImage'

const LIST = 'list'
const SECONDARY = 'secondary'
const THUMBNAIL = 'thumbnail'
const SIDEBAR = 'sidebar'
const RECENT_NEWS = 'recent_news'

const CategoryArticle = ({
  id,
  title,
  uri,
  featuredImage,
  date,
  isFirst,
  isLast,
  type = LIST,
  categories
}: CategoryArticleProps) => {
  const typeIs = (typeName: string): boolean => type === typeName
  const classes = cn(
    {
      'flex w-full flex-row border-b border-slate-200 py-6 dark:border-neutral-500':
        typeIs(LIST)
    },
    {
      'flex flex-col flex-col-reverse':
        typeIs(SECONDARY) || typeIs(SIDEBAR) || typeIs(RECENT_NEWS)
    },
    {
      'mb-6 flex w-full flex-row flex-row-reverse md:flex-col md:flex-col-reverse':
        typeIs(THUMBNAIL)
    },
    { 'border-b-0': isLast },
    { 'pt-0': isFirst },
    'relative'
  )

  const classesImage = cn(
    {
      'mt-8 ml-3 h-16 w-20 sm:mt-0 sm:ml-5 sm:h-28 sm:w-40 lg:h-32 lg:w-48':
        typeIs(LIST)
    },
    {
      'h-32 w-full border-b border-b-2 border-slate-500 sm:h-40 md:border-none':
        typeIs(SECONDARY)
    },
    {
      'h-32 w-full border-b border-b-2 border-slate-500 md:border-none':
        typeIs(SIDEBAR)
    },
    {
      'h-20 w-full border-b border-b-2 border-slate-500 md:border-none':
        typeIs(RECENT_NEWS)
    },
    {
      'ml-3 h-28 w-1/3 md:mb-2 md:ml-0 md:w-full': typeIs(THUMBNAIL)
    },
    'image-wrapper relative z-0'
  )

  const classesTitle = cn(
    {
      'mb-3 font-sans text-lg leading-7 font-bold sm:text-xl': typeIs(LIST)
    },
    {
      'text-basemt-2 mb-3 font-sans leading-6 font-bold sm:leading-7 md:mb-2 md:text-lg':
        typeIs(SECONDARY)
    },
    {
      'mt-2 mb-3 font-sans text-sm leading-5 font-medium md:mb-2':
        typeIs(SIDEBAR)
    },
    {
      'mt-2 mb-3 font-sans text-sm leading-5 font-medium md:mb-2':
        typeIs(RECENT_NEWS)
    },
    {
      'ml-3 font-sans text-base leading-6 md:text-base lg:leading-6':
        typeIs(THUMBNAIL)
    },
    'title hover:text-primary hover:dark:text-secondary block text-slate-700 dark:text-neutral-300'
  )

  const classesTitleWrapper = cn(
    {
      'z-10 mx-2 -mt-5 bg-white pt-1 pr-2 pb-2 pl-3 md:mx-0 md:mt-0 md:pb-1 md:pl-2 dark:bg-neutral-900':
        typeIs(SECONDARY) || typeIs(SIDEBAR) || typeIs(RECENT_NEWS)
    },
    'title-wrapper relative z-10'
  )

  const classesContentWrapper = cn(
    {
      'w-2/3 md:w-full': typeIs(THUMBNAIL)
    },
    'content-wrapper relative z-10 flex-1 font-sans'
  )

  const classesCoverImage = cn(
    {
      'h-16 w-20 w-full sm:h-28 sm:w-40 lg:h-32 lg:w-48': typeIs(LIST)
    },
    {
      'h-40 w-full': typeIs(SECONDARY)
    },
    {
      'h-32 w-full overflow-hidden rounded-sm': typeIs(SIDEBAR)
    },
    {
      'h-20 w-full overflow-hidden rounded-sm': typeIs(RECENT_NEWS)
    },
    {
      'h-28 w-full': typeIs(THUMBNAIL)
    },
    'relative block'
  )
  const limitedTitle = limitStringCharacters(title)

  if (!limitedTitle || limitedTitle.length <= 10) {
    return null
  }

  return (
    <article key={id} className={classes}>
      <div className={classesContentWrapper}>
        {(categories && typeIs(THUMBNAIL)) ||
          (typeIs(LIST) && (
            <div className='mb-1'>
              <PostCategories
                className={`text-primary dark:text-secondary uppercase ${typeIs(LIST) ? '' : 'ml-3'}`}
                {...categories}
              />
            </div>
          ))}
        <div className={classesTitleWrapper}>
          <h2 className={classesTitle}>
            <Link
              className={`link-article-${type}`}
              href={uri}
              aria-label={limitedTitle}
              onClick={() =>
                GAEvent({
                  category: 'CATEGORY_ARTICLE',
                  label: `${type?.toUpperCase()}`
                })
              }
            >
              {limitedTitle}
            </Link>
          </h2>

          {(typeIs(SECONDARY) || typeIs(SIDEBAR)) && (
            <hr className='relative mt-4 mb-3 w-2/3 text-slate-200 md:mt-0 lg:w-3/4 dark:border-neutral-500 dark:bg-neutral-300' />
          )}
        </div>
        {type === LIST && (
          <div className='text-sm text-slate-500 dark:text-neutral-300'>
            <DateTime dateString={date} />
          </div>
        )}
      </div>
      {featuredImage && (
        <div className={classesImage}>
          {categories &&
            (typeIs(SECONDARY) || typeIs(SIDEBAR) || typeIs(RECENT_NEWS)) && (
              <div className='absolute -top-2 left-0 z-10 bg-white pl-2 md:top-auto md:-bottom-1 dark:bg-neutral-900'>
                <PostCategories
                  className='text-primary dark:text-slate-200'
                  {...categories}
                />
              </div>
            )}
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <LazyImage
              uri={uri}
              title={limitedTitle}
              coverImage={featuredImage?.node.sourceUrl}
              className={classesCoverImage}
            />
          </div>
        </div>
      )}
    </article>
  )
}

export { CategoryArticle }
