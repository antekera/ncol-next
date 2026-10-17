'use client'

import { Fragment } from 'react'
import * as Sentry from '@sentry/nextjs'
import { CategoryArticle } from '@components/CategoryArticle'
import { useHomeLeftPosts } from '@lib/hooks/data/useHomeLeftPosts'
import { PostHome, PostsFetcherProps } from '@lib/types'
import { LeftPostsSkeleton } from '@components/LoadingHome'
import { useInView } from 'react-intersection-observer'
import { CATEGORIES } from '@lib/constants'
import ContextStateData from '@lib/context/StateContext'

export const ClientLeftPosts = ({
  qty,
  offset,
  enableLazyLoad,
  excludeUri
}: Omit<PostsFetcherProps, 'slug'> & {
  enableLazyLoad?: boolean
  excludeUri?: string
}) => {
  const { coverSlug } = ContextStateData()
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
    offset,
    enabled: shouldFetch
  })

  if (error) {
    Sentry.captureException(error, {
      tags: { component: 'HomeLeftPosts' },
      extra: { slug: CATEGORIES.COL_LEFT, qty, offset }
    })
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

  const filteredEdgesBySlug = edges.filter(
    ({ node }: { node: PostHome }) =>
      node.uri !== coverSlug && node.uri !== excludeUri
  )

  return (
    <section
      ref={ref}
      data-module-id={`current-left-${offset === 0 ? 1 : 2}`}
      data-editorial-position={offset === 0 ? 2 : 6}
    >
      {filteredEdgesBySlug.map(({ node }, index) => (
        <Fragment key={node.id}>
          <CategoryArticle
            {...node}
            homePosition={index + 1}
            excerpt={undefined}
            type='secondary'
            isFirst={index === 0}
            isLast={index + 1 === edges.length}
          />
        </Fragment>
      ))}
    </section>
  )
}
