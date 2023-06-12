import cn from 'classnames'
import Link from 'next/link'

import { CoverImage } from '@components/CoverImage'
import { DateTime } from '@components/DateTime'
import { Excerpt } from '@components/Excerpt'
import { PostCategories } from '@components/PostCategories'
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
}: CategoryArticleProps): JSX.Element => {
  const typeIs = (typeName: string): boolean => type === typeName
  const classes = cn(
    { 'flex flex-row w-full py-6 border-b border-slate-200': typeIs(LIST) },
    {
      'flex flex-col flex-col-reverse':
        typeIs(SECONDARY) || typeIs(SIDEBAR) || typeIs(RECENT_NEWS)
    },
    {
      'flex flex-row w-full md:flex-col md:flex-col-reverse flex-row-reverse mb-6':
        typeIs(THUMBNAIL)
    },
    { 'border-b-0': isLast },
    { 'pt-0': isFirst },
    'relative'
  )

  const classesImage = cn(
    {
      'w-20 h-16 ml-3 sm:ml-5 sm:w-40 sm:h-28 lg:w-60 lg:h-40': typeIs(LIST)
    },
    {
      'border-b border-b-2 md:border-none border-slate-500 w-full h-32 sm:h-40':
        typeIs(SECONDARY)
    },
    {
      'border-b border-b-2 md:border-none border-slate-500 w-full h-32':
        typeIs(SIDEBAR)
    },
    {
      'border-b border-b-2 md:border-none border-slate-500 w-full h-20':
        typeIs(RECENT_NEWS)
    },
    {
      'md:w-full w-1/3 ml-3 md:ml-0 h-28 md:mb-2': typeIs(THUMBNAIL)
    },
    'image-wrapper z-0 relative'
  )

  const classesTitle = cn(
    {
      'mb-3 text-lg leading-tight sm:text-xl md:text-2xl font-sans_medium':
        typeIs(LIST)
    },
    {
      'mt-2 mb-3 md:mb-2 text-lg leading-tight font-sans_medium':
        typeIs(SECONDARY) || typeIs(SIDEBAR)
    },
    {
      'mt-2 mb-3 md:mb-2 text-sm leading-tight font-sans_medium':
        typeIs(RECENT_NEWS)
    },
    {
      'ml-3 leading-tight sm:leading-snug font-sans text-base sm:text-lg md:text-base':
        typeIs(THUMBNAIL)
    },
    'title text-slate-700 hover:text-primary block'
  )

  const classesTitleWrapper = cn(
    {
      '-mt-5 md:mt-0 bg-white z-10 mx-2 md:mx-0 pl-3 md:pl-2 pr-2 pb-2 md:pb-1 pt-1':
        typeIs(SECONDARY) || typeIs(SIDEBAR) || typeIs(RECENT_NEWS)
    },
    'title-wrapper z-10 relative'
  )

  const classesContentWrapper = cn(
    {
      'md:w-full w-2/3': typeIs(THUMBNAIL)
    },
    'content-wrapper z-10 relative flex-1'
  )

  const classesCoverImage = cn(
    {
      'w-full w-20 h-16 sm:w-40 sm:h-28 lg:w-60 lg:h-40': typeIs(LIST)
    },
    {
      'w-full h-40': typeIs(SECONDARY)
    },
    {
      'rounded overflow-hidden w-full h-32': typeIs(SIDEBAR)
    },
    {
      'rounded overflow-hidden w-full h-20': typeIs(RECENT_NEWS)
    },
    {
      'w-full h-28': typeIs(THUMBNAIL)
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
            <hr className='relative w-2/3 mt-4 mb-3 lg:w-3/4 md:mt-0 text-slate-200' />
          )}
        </div>
        {excerpt && <Excerpt className='hidden mb-3 sm:block' text={excerpt} />}
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
              <div className='absolute left-0 z-10 pl-2 bg-white -top-2 md:-bottom-1 md:top-auto'>
                <PostCategories className='text-primary' {...categories} />
              </div>
            )}
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <CoverImage
              uri={uri}
              title={title}
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
