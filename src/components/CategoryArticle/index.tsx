'use client'

import Link from 'next/link'

import { CoverImage } from '@components/CoverImage'
import { DateTime } from '@components/DateTime'
import { Excerpt } from '@components/Excerpt'
import { PostCategories } from '@components/PostCategories'
import { cn } from '@lib/shared'
import { GAEvent } from '@lib/utils/ga'
import { CategoryArticleProps } from 'lib/types'

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
  excerpt,
  date,
  isFirst,
  isLast,
  type = LIST,
  categories
}: CategoryArticleProps) => {
  const typeIs = (typeName: string): boolean => type === typeName
  const classes = cn(
    { 'flex w-full flex-row border-b border-slate-200 py-6': typeIs(LIST) },
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
      'ml-3 h-16 w-20 sm:ml-5 sm:h-28 sm:w-40 lg:h-40 lg:w-60': typeIs(LIST)
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
      'mb-3 font-sans_medium text-lg leading-tight sm:text-xl md:text-2xl':
        typeIs(LIST)
    },
    {
      'text-md mb-3 mt-2 font-sans_medium leading-tight md:mb-2 md:text-lg md:leading-snug':
        typeIs(SECONDARY)
    },
    {
      'text-md md:te mb-3 mt-2 font-sans_medium leading-tight md:mb-2':
        typeIs(SIDEBAR)
    },
    {
      'mb-3 mt-2 font-sans_medium text-sm leading-tight md:mb-2':
        typeIs(RECENT_NEWS)
    },
    {
      'ml-3 font-sans text-base leading-tight md:text-base': typeIs(THUMBNAIL)
    },
    'title block text-slate-700 hover:text-primary'
  )

  const classesTitleWrapper = cn(
    {
      'z-10 mx-2 -mt-5 bg-white pb-2 pl-3 pr-2 pt-1 md:mx-0 md:mt-0 md:pb-1 md:pl-2':
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
      'h-16 w-20 w-full sm:h-28 sm:w-40 lg:h-40 lg:w-60': typeIs(LIST)
    },
    {
      'h-40 w-full': typeIs(SECONDARY)
    },
    {
      'h-32 w-full overflow-hidden rounded': typeIs(SIDEBAR)
    },
    {
      'h-20 w-full overflow-hidden rounded': typeIs(RECENT_NEWS)
    },
    {
      'h-28 w-full': typeIs(THUMBNAIL)
    },
    'relative block'
  )

  return (
    <article key={id} className={classes}>
      <div className={classesContentWrapper}>
        {categories && typeIs(THUMBNAIL) && (
          <div className='mb-1'>
            <PostCategories
              className='ml-3 uppercase text-primary'
              {...categories}
            />
          </div>
        )}
        <div className={classesTitleWrapper}>
          <h2 className={classesTitle}>
            <Link
              className={`link-article-${type}`}
              href={uri}
              aria-label={title}
              onClick={() =>
                GAEvent({
                  category: 'CATEGORY_ARTICLE',
                  label: `${type?.toUpperCase()}`
                })
              }
            >
              {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
              {title}
            </Link>
          </h2>
          {(typeIs(SECONDARY) || typeIs(SIDEBAR)) && (
            <hr className='relative mb-3 mt-4 w-2/3 text-slate-200 md:mt-0 lg:w-3/4' />
          )}
        </div>
        {excerpt && <Excerpt className='mb-3 hidden sm:block' text={excerpt} />}
        {type === LIST && (
          <div className='text-sm text-slate-500'>
            <DateTime dateString={date} />
          </div>
        )}
      </div>
      {featuredImage && (
        <div className={classesImage}>
          {categories &&
            (typeIs(SECONDARY) || typeIs(SIDEBAR) || typeIs(RECENT_NEWS)) && (
              <div className='absolute -top-2 left-0 z-10 bg-white pl-2 md:-bottom-1 md:top-auto'>
                <PostCategories className='text-primary' {...categories} />
              </div>
            )}
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <CoverImage
              uri={uri}
              title={title}
              coverImage={featuredImage?.node.sourceUrl}
              className={classesCoverImage}
              lazy
            />
          </div>
        </div>
      )}
    </article>
  )
}

export { CategoryArticle }
