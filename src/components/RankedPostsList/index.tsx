'use client'

import { CategoryArticle } from '@components/CategoryArticle'
import { MostVisitedPostsSkeleton } from '@components/MostVisitedPosts/MostVisitedPostsSkeleton'
import * as Sentry from '@sentry/browser'
import { useIsMobile } from '@lib/hooks/useIsMobile'
import {
  getContainerClasses,
  getTitleSectionClasses,
  getTitleClasses,
  getSeparatorClasses,
  getPostsContainerClasses,
  getPostClasses,
  getPostRankClasses,
} from './styles'
import { MostVisitedApiResponse } from '@lib/types'

const DEFAULT_TITLE = 'Más Leídos'

export interface Props {
  className?: string
  showTitle?: boolean
  title?: string
  data?: MostVisitedApiResponse
  error?: any
}

const RankedPostsList = ({
  className,
  showTitle = true,
  title = DEFAULT_TITLE,
  data,
  error,
}: Props) => {
  const isMobile = useIsMobile()

  const hasData = data && data.posts.length > 0
  const isRow = !isMobile
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
    <div className={containerClasses}>
      {showTitle && (
        <div className={titleSectionClasses}>
          <h5 className={titleClasses}>{title}</h5>
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
          .filter((post) => post?.image && post?.slug)
          .map(({ slug, image, title }, index) => {
            return (
              <div key={slug} className={postClasses}>
                <div className={getPostRankClasses(isRow)}>
                  <span>{index + 1}</span>
                </div>
                <div className="z-10">
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

export { RankedPostsList }