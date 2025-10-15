'use client'

import { CategoryArticle } from '@components/CategoryArticle'
import { MostVisitedPostsSkeleton } from './MostVisitedPostsSkeleton'
import { useMostVisitedPosts } from '@lib/hooks/data/useMostVisitedPosts'
import { useInView } from 'react-intersection-observer'
import { Plus } from 'lucide-react'
import * as Sentry from '@sentry/browser'
import { useIsMobile } from '@lib/hooks/useIsMobile'
import { cn } from '@lib/shared'

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

  if (error) {
    Sentry.captureException('Failed to fetch category left posts')
    return null
  }

  return (
    <div className={cn('most-visited-posts', className)} ref={ref}>
      {showTitle && (
        <div
          className={cn('most-visited-posts-title-section', {
            'most-visited-posts-title-section-visible': showTitle,
            'most-visited-posts-title-section-hidden': !showTitle
          })}
        >
          <h5 className='most-visited-posts-title'>
            <Plus className='relative -top-0.5 mr-1 inline text-xs' />
            {title}
          </h5>
          <hr className='most-visited-posts-separator' />
        </div>
      )}

      {!hasData && (
        <div
          className={cn('most-visited-posts-container', {
            'most-visited-posts-container-row': isRow,
            'most-visited-posts-container-column': !isRow
          })}
        >
          <MostVisitedPostsSkeleton
            isRow={isRow}
            className={cn('most-visited-posts-post', {
              'most-visited-posts-post-row': isRow,
              'most-visited-posts-post-column': !isRow
            })}
          />
        </div>
      )}

      <div
        className={cn('most-visited-posts-container', {
          'most-visited-posts-container-row': isRow,
          'most-visited-posts-container-column': !isRow
        })}
      >
        {data?.posts
          .filter(post => post?.image && post?.slug)
          .map(({ slug, image, title }, index) => {
            return (
              <div
                key={slug}
                className={cn('most-visited-posts-post', {
                  'most-visited-posts-post-row': isRow,
                  'most-visited-posts-post-column': !isRow
                })}
              >
                <div
                  className={cn('most-visited-posts-post-rank', {
                    'most-visited-posts-post-rank-row': isRow,
                    'most-visited-posts-post-rank-column': !isRow
                  })}
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