'use client'

import { CategoryArticleProps } from 'lib/types'
import { HoverPrefetchLink } from '@components/HoverPrefetchLink'
import { DateTime } from '@components/DateTime'
import { PostCategories } from '@components/PostCategories'
import { GAEvent } from '@lib/utils/ga'
import { limitStringCharacters } from '@lib/utils/limitStringCharacters'
import { LazyImage } from '@components/LazyImage'
import { GA_EVENTS } from '@lib/constants'
import {
  getCategoryArticleClasses,
  getImageClasses,
  getTitleClasses,
  getTitleWrapperClasses,
  getContentWrapperClasses,
  getCoverImageClasses
} from './styles'

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
  imageSize,
  customFields
}: CategoryArticleProps) => {
  const typeIs = (typeName: string): boolean => type === typeName
  const classes = getCategoryArticleClasses({ type, isFirst, isLast })
  const classesImage = getImageClasses({ type })
  const classesTitle = getTitleClasses({ type })
  const classesTitleWrapper = getTitleWrapperClasses({ type })
  const classesContentWrapper = getContentWrapperClasses({ type })
  const classesCoverImage = getCoverImageClasses({ type })
  const limitedTitle = limitStringCharacters(title)

  if (!limitedTitle || limitedTitle.length <= 10) {
    return null
  }

  return (
    <article key={id} className={classes}>
      <div className={classesContentWrapper}>
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
        <div className={classesTitleWrapper}>
          <h2 className={classesTitle}>
            <HoverPrefetchLink
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
            </HoverPrefetchLink>
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
              className={classesCoverImage}
              size={imageSize}
            />
            {customFields?.videodestacado && (
              <span className='bg-secondary pointer-events-none absolute top-1 right-1 z-20 rounded p-1 px-1.5 py-0.5 font-sans text-[10px] font-bold tracking-wide text-white uppercase shadow'>
                + Video
              </span>
            )}
          </div>
        </div>
      )}
    </article>
  )
}

export { CategoryArticle }
