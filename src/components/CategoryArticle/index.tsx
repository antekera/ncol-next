import cn from 'classnames'
import Link from 'next/link'

import {
  DateTime,
  CoverImage,
  Excerpt,
  PostCategories
} from '@components/index'
import { Post } from 'lib/types'

const LIST = 'list'
const SECONDARY = 'secondary'
const THUMBNAIL = 'thumbnail'

interface CategoryArticleProps extends Post {
  className?: string
  isLast: boolean
  isFirst: boolean
  type?: 'list' | 'secondary' | 'thumbnail'
}

const defaultProps = {
  type: LIST
}

const CategoryArticle = ({
  id,
  title,
  uri,
  featuredImage,
  excerpt,
  date,
  isFirst,
  isLast,
  type,
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
      'mb-3 text-lg leading-tight sm:text-xl md:text-2xl': type === LIST
    },
    {
      'mt-2 mb-3 md:mb-2 text-base leading-tight font-sans_bold':
        type === SECONDARY
    },
    {
      'ml-3 leading-tight sm:leading-snug font-sans text-base sm:text-lg md:text-base':
        type === THUMBNAIL
    },
    'title text-slate-700 hover:text-primary'
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
          <Link href={uri}>
            <a aria-label={title}>
              <h2 className={classesTitle}>{title}</h2>
            </a>
          </Link>
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
            />
          </div>
        </div>
      )}
    </article>
  )
}

CategoryArticle.defaultProps = defaultProps

export { CategoryArticle }
