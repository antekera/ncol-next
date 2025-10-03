'use client'

import { CategoryArticle } from '@components/CategoryArticle'
import { MostVisitedPostsSkeleton } from './MostVisitedPostsSkeleton'
import { useMostVisitedPosts } from '@lib/hooks/data/useMostVisitedPosts'
import { useInView } from 'react-intersection-observer'
import { Plus } from 'lucide-react'
import * as Sentry from '@sentry/browser'
import { useIsMobile } from '@lib/hooks/useIsMobile'
import {
  getContainerClasses,
  getTitleSectionClasses,
  getTitleClasses,
  getSeparatorClasses,
  getPostsContainerClasses,
  getPostClasses,
  getPostRankClasses
} from './styles'

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

  const containerClasses = getContainerClasses(className)
  const titleSectionClasses = getTitleSectionClasses(showTitle)
  const titleClasses = getTitleClasses()
  const separatorClasses = getSeparatorClasses()
  const postsContainerClasses = getPostsContainerClasses(isRow)
  const postClasses = getPostClasses(isRow)

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
                <div className={getPostRankClasses(isRow)}>
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
