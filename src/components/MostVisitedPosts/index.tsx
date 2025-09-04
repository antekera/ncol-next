'use client'

import { CategoryArticle } from '@components/CategoryArticle'
import { MostVisitedPostsSkeleton } from './MostVisitedPostsSkeleton'
import { cn } from '@lib/shared'
import { useMostVisitedPosts } from '@lib/hooks/data/useMostVisitedPosts'
import { useInView } from 'react-intersection-observer'
import { Plus } from 'lucide-react'
import * as Sentry from '@sentry/browser'
import { useIsMobile } from '@lib/hooks/useIsMobile'

const DEFAULT_TITLE = 'Visto Ahora'

export interface Props {
  isLayoutMobile?: boolean
  className?: string
  showTitle?: boolean
  title?: string
}

const MostVisitedPosts = ({
  isLayoutMobile,
  className,
  showTitle = true,
  title = DEFAULT_TITLE
}: Props) => {
  const isMobile = useIsMobile()
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true
  })

  const { data, error } = useMostVisitedPosts(inView)

  const hasData = data && data.posts.length > 0
  const isRow = !isMobile && !isLayoutMobile

  const containerClasses = cn('most-visited-posts', className)
  const titleSectionClasses = cn('mb-4', showTitle ? 'block' : 'hidden')
  const titleClasses = cn(
    'mb-1 font-sans text-sm leading-none font-bold text-slate-700 uppercase dark:text-neutral-300'
  )
  const separatorClasses = cn('border-gray-300 dark:border-neutral-500')
  const postsContainerClasses = cn(
    isRow
      ? 'space-y-4'
      : 'slides-container flex snap-x snap-mandatory flex-nowrap space-x-3 overflow-hidden overflow-x-auto rounded-sm'
  )
  const postClasses = cn(
    'relative border-slate-200 dark:border-neutral-500',
    isRow ? 'border-b pb-4 last:border-b-0' : 'slide w-48 flex-none pt-2'
  )

  if (error) {
    Sentry.captureException('Failed to fetch category left posts')
    return null
  }

  return (
    <div className={containerClasses} ref={ref}>
      {showTitle && (
        <div className={titleSectionClasses}>
          <h5 className={titleClasses}>
            <Plus className='relative -top-0.5 mr-1 inline text-xs' />
            {title}
          </h5>
          <hr className={separatorClasses} />
        </div>
      )}

      {!hasData && (
        <div className={postsContainerClasses}>
          <MostVisitedPostsSkeleton isRow={isRow} className={postClasses} />
        </div>
      )}

      <div className={postsContainerClasses}>
        {data?.posts
          .filter(post => post?.image && post?.slug)
          .map(({ slug, image, title }, index) => {
            return (
              <div key={slug} className={postClasses}>
                <div
                  className={cn(
                    isRow ? 'top-0' : 'top-2',
                    'pointer-events-none absolute left-0 z-10 flex h-7 w-7 items-center justify-center rounded-tl-xs bg-sky-600/75 text-center font-sans text-lg text-sm text-white dark:bg-neutral-600/75 dark:text-neutral-200'
                  )}
                >
                  <span>{index + 1}</span>
                </div>
                <div className='z-10'>
                  <CategoryArticle
                    id={slug}
                    title={title}
                    uri={slug}
                    featuredImage={{ node: { sourceUrl: image } }}
                    type={isRow ? 'most_visited' : 'recent_news'}
                    imageSize={isMobile ? 'sm' : 'xs'}
                  />
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

export { MostVisitedPosts }
