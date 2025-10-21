'use client'

import { CategoryArticle } from '@components/CategoryArticle'
import * as Sentry from '@sentry/browser'
import { useIsMobile } from '@lib/hooks/useIsMobile'
import { getPostClasses, getPostRankClasses } from './styles'
import { MostVisitedApiResponse } from '@lib/types'
import { Suspense } from 'react'
import { Loading } from '@components/LoadingCategory'

export interface Props {
  data?: MostVisitedApiResponse
  error?: Error
  isLoading?: boolean
}

const RankedPostsList = ({ data, error, isLoading }: Props) => {
  const isMobile = useIsMobile()

  if (error) {
    Sentry.captureException('Failed to fetch category left posts')
    return null
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <Suspense fallback={<Loading />}>
      {data?.posts
        .filter(post => post?.image && post?.slug)
        .map(({ slug, image, title }, index) => {
          return (
            <div key={slug} className={getPostClasses()}>
              <div className={getPostRankClasses()}>
                <span>{index + 1}</span>
              </div>
              <div className='z-10'>
                <CategoryArticle
                  id={slug}
                  title={title}
                  uri={slug}
                  featuredImage={{ node: { sourceUrl: image } }}
                  type={true ? 'most_visited' : 'recent_news'}
                  imageSize={isMobile ? 'sm' : 'xs'}
                />
              </div>
            </div>
          )
        })}
    </Suspense>
  )
}

export { RankedPostsList }
