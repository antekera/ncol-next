'use client'

import { Fragment } from 'react'
import * as Sentry from '@sentry/nextjs'
import { CategoryArticle } from '@components/CategoryArticle'
import { useHomeRightPosts } from '@lib/hooks/data/useHomeRightPosts'
import { PostsFetcherProps } from '@lib/types'
import { RightPostsSkeleton } from '@components/LoadingHome'
import { useInView } from 'react-intersection-observer'
import { CATEGORIES } from '@lib/constants'

export const ClientRightPosts = ({
  qty,
  offset,
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
    offset,
    enabled: shouldFetch
  })

  if (error) {
    Sentry.captureException(error, {
      tags: { component: 'HomeRightPosts' },
      extra: { slug: CATEGORIES.COL_RIGHT, qty, offset }
    })
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

  const edges = (result?.edges ?? []).filter(
    ({ node }) => !node.categories?.edges?.some(e => e.node.slug === 'opinion')
  )

  return (
    <section
      ref={ref}
      data-module-id={`current-right-${offset === 0 ? 1 : 2}`}
      data-editorial-position={offset === 0 ? 3 : 7}
    >
      {edges.map(({ node }, index) => (
        <Fragment key={node.id}>
          <CategoryArticle
            {...node}
            homePosition={index + 1}
            excerpt={undefined}
            type='thumbnail'
            isFirst={index === 0}
            isLast={index + 1 === edges.length}
          />
        </Fragment>
      ))}
    </section>
  )
}
