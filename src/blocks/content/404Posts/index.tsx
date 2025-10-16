'use client'

import * as Sentry from '@sentry/browser'
import { notFound } from 'next/navigation'
import { CategoryArticle } from '@components/CategoryArticle'
import { Loading } from '@components/LoadingCategory'
import { useCategoryPosts } from '@lib/hooks/data/useCategoryPosts'
import { CATEGORIES } from '@lib/constants'
import './404-posts.css'

export const Content = () => {
  const {
    data: result,
    error,
    isLoading
  } = useCategoryPosts({
    slug: CATEGORIES.COL_LEFT,
    qty: 10
  })

  if (error) {
    Sentry.captureException('Failed to fetch category posts')
    return notFound()
  }

  const { edges } = result ?? { edges: [] }

  return (
    <>
      <p className='not-found-posts-title'>Noticias recientes:</p>
      {isLoading ? (
        <Loading />
      ) : (
        edges.map(({ node }, index) => (
          <CategoryArticle
            key={node.id}
            {...node}
            isFirst={index === 0}
            isLast={index + 1 === edges.length}
          />
        ))
      )}
    </>
  )
}