'use client'

import { Fragment } from 'react'
import * as Sentry from '@sentry/browser'
import { CategoryArticle } from '@components/CategoryArticle'
import { useHomeLeftPosts } from '@lib/hooks/data/useHomeLeftPosts'
import { PostsFetcherProps } from '@lib/types'
import { LeftPostsSkeleton } from '@components/LoadingHome'
import { useInView } from 'react-intersection-observer'
import { CATEGORIES } from '@lib/constants'

export const ClientLeftPosts = ({
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
  } = useHomeLeftPosts({
    slug: CATEGORIES.COL_LEFT,
    qty,
    offset: qty,
    enabled: shouldFetch
  })

  if (error) {
    Sentry.captureException('Failed to fetch category left posts')
    return null
  }

  if (isLoading) {
    return (
      <div ref={ref}>
        <LeftPostsSkeleton />
        <LeftPostsSkeleton />
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
            type='secondary'
            isFirst={index === 0}
            isLast={index + 1 === edges.length}
          />
        </Fragment>
      ))}
    </div>
  )
}
