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
  const classes = cn(
    { 'flex flex-row w-full py-6 border-b border-slate-200': type === LIST },
    { 'flex flex-col flex-col-reverse': type === SECONDARY },
    {
      'flex flex-row w-full md:flex-col md:flex-col-reverse flex-row-reverse mb-6':
        type === THUMBNAIL
    },
    { 'border-b-0': isLast },
    { 'pt-0': isFirst },
    'relative'
  )

  const classesImage = cn(
    {
      'w-20 h-16 ml-3 sm:ml-5 sm:w-40 sm:h-28 lg:w-60 lg:h-40': type === LIST
    },
    {
      'border-b border-b-2 md:border-none border-slate-500 w-full h-32 sm:h-40':
        type === SECONDARY
    },
    {
      'md:w-full w-1/3 ml-3 md:ml-0 h-28 md:mb-2': type === THUMBNAIL
    },
    'image-wrapper z-0 relative'
  )

  const classesTitle = cn(
    {
      'mb-3 text-lg leading-tight sm:text-xl md:text-2xl font-sans_medium':
        type === LIST
    },
    {
      'mt-2 mb-3 md:mb-2 text-lg leading-tight font-sans_medium':
        type === SECONDARY
    },
    {
      'ml-3 leading-tight sm:leading-snug font-sans text-base sm:text-lg md:text-base':
        type === THUMBNAIL
    },
    'title text-slate-700 hover:text-primary block'
  )

  const classesTitleWrapper = cn(
    {
      '-mt-5 md:mt-0 bg-white z-10 mx-2 md:mx-0 pl-3 md:pl-2 pr-2 pb-2 md:pb-1 pt-1':
        type === SECONDARY
    },
    'title-wrapper z-10 relative'
  )

  const classesContentWrapper = cn(
    {
      'md:w-full w-2/3': type === THUMBNAIL
    },
    'content-wrapper z-10 relative flex-1'
  )

  const classesCoverImage = cn(
    {
      'w-full w-20 h-16 sm:w-40 sm:h-28 lg:w-60 lg:h-40': type === LIST
    },
    {
      'w-full h-40': type === SECONDARY
    },
    {
      'w-full h-28': type === THUMBNAIL
    },
    'relative block'
  )

  return (
    <article key={id} className={classes}>
      <div className={classesContentWrapper}>
        {categories && type === THUMBNAIL && (
          <div className='mb-1'>
            <PostCategories
              className='ml-3 uppercase text-primary'
              {...categories}
            />
          </div>
        )}
        <div className={classesTitleWrapper}>
          <h2 className={classesTitle}>
            <Link className={`link-article-${type}`} href={uri}>
              {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
              <a
                aria-label={title}
                onClick={() =>
                  GAEvent({
                    category: 'CATEGORY_ARTICLE',
                    label: `${type?.toUpperCase()}`
                  })
                }
              >
                {title}
              </a>
            </Link>
          </h2>
          {type === SECONDARY && (
            <hr className='relative w-48 mt-4 mb-3 md:w-3/4 md:mt-0 md:w-80 text-slate-200' />
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
          {categories && type === SECONDARY && (
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
