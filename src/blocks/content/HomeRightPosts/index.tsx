'use client'

import { Fragment } from 'react'
import * as Sentry from '@sentry/browser'
import { CategoryArticle } from '@components/CategoryArticle'
import { useHomeRightPosts } from '@lib/hooks/data/useHomeRightPosts'
import { PostsFetcherProps } from '@lib/types'
import { RightPostsSkeleton } from '@components/LoadingHome'
import { useInView } from 'react-intersection-observer'
import { CATEGORIES } from '@lib/constants'

export const ClientRightPosts = ({
  qty,
  enableLazyLoad
}: Omit<PostsFetcherProps, 'slug'> & {
  enableLazyLoad?: boolean
}) => {
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true
  })

  const shouldFetch = enableLazyLoad === true ? inView : true

  const {
    data: result,
    error,
    isLoading
  } = useHomeRightPosts({
    slug: CATEGORIES.COL_RIGHT,
    qty,
    offset: qty,
    enabled: shouldFetch
  })

  if (error) {
    Sentry.captureException('Failed to fetch category posts')
    return null
  }

  if (isLoading) {
    return (
      <div ref={ref}>
        <RightPostsSkeleton />
        <RightPostsSkeleton />
        <RightPostsSkeleton />
      </div>
    )
  }

  if (result?.edges.length === 0 && !isLoading) {
    return null
  }

  const { edges } = result ?? { edges: [] }

  return (
    <div ref={ref}>
      {edges.map(({ node }, index) => (
        <Fragment key={node.id}>
          <CategoryArticle
            {...node}
            excerpt={undefined}
            type='thumbnail'
            isFirst={index === 0}
            isLast={index + 1 === edges.length}
          />
        </Fragment>
      ))}
    </div>
  )
}
