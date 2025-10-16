'use client'

import { CategoryArticleProps } from 'lib/types'
import Link from 'next/link'
import { DateTime } from '@components/DateTime'
import { PostCategories } from '@components/PostCategories'
import { GAEvent } from '@lib/utils/ga'
import { limitStringCharacters } from '@lib/utils/limitStringCharacters'
import { LazyImage } from '@components/LazyImage'
import { GA_EVENTS } from '@lib/constants'
import { cn } from '@lib/shared'
import './category-article.css'

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
  categories,
  imageSize
}: CategoryArticleProps) => {
  const typeIs = (typeName: string): boolean => type === typeName
  const limitedTitle = limitStringCharacters(title)

  if (!limitedTitle || limitedTitle.length <= 10) {
    return null
  }

  return (
    <article
      key={id}
      className={cn(
        'category-article',
        `category-article-${type}`,
        { 'category-article-first': isFirst },
        { 'category-article-last': isLast }
      )}
    >
      <div
        className={cn(
          'category-article-content-wrapper',
          `category-article-content-wrapper-${type}`
        )}
      >
        {categories && (typeIs(THUMBNAIL) || typeIs(LIST)) && (
          <div className={`${!typeIs(THUMBNAIL) && 'mb-1'}`}>
            <PostCategories
              slice={1}
              className={`text-primary uppercase ${typeIs(LIST) ? '' : 'ml-3'}`}
              {...categories}
              type={type}
            />
          </div>
        )}
        <div
          className={cn(
            'category-article-title-wrapper',
            `category-article-title-wrapper-${type}`
          )}
        >
          <h2
            className={cn(
              'category-article-title',
              `category-article-title-${type}`
            )}
          >
            <Link
              className={`link-article-${type}`}
              href={uri}
              aria-label={limitedTitle}
              onClick={() =>
                GAEvent({
                  category: GA_EVENTS.POST_LINK.SINGLE.CATEGORY,
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
        <div
          className={cn(
            'category-article-image-wrapper',
            `category-article-image-wrapper-${type}`
          )}
        >
          {categories &&
            (typeIs(SECONDARY) || typeIs(SIDEBAR) || typeIs(RECENT_NEWS)) && (
              <div className='absolute -top-2 left-0 z-10 bg-white pl-2 md:top-auto md:-bottom-1 dark:bg-neutral-900'>
                <PostCategories
                  slice={1}
                  className='text-primary dark:text-slate-200'
                  {...categories}
                  type={type}
                />
              </div>
            )}
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <LazyImage
              uri={uri}
              title={limitedTitle}
              coverImage={featuredImage?.node.sourceUrl}
              srcSet={featuredImage?.node.sourceUrl}
              className={cn(
                'category-article-cover-image',
                `category-article-cover-image-${type}`
              )}
              size={imageSize}
            />
          </div>
        </div>
      )}
    </article>
  )
}

export { CategoryArticle }