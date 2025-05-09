'use client'

import * as Sentry from '@sentry/browser'
import { notFound } from 'next/navigation'
import { CategoryArticle } from '@components/CategoryArticle'
import { Loading } from '@components/LoadingCategory'
import { useCategoryPosts } from '@lib/hooks/data/useCategoryPosts'
import { CATEGORIES } from '@lib/constants'

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
      <p className='mb-6 border-b border-slate-200 py-4 font-sans text-2xl font-medium text-slate-900 md:text-3xl dark:border-neutral-500 dark:text-neutral-300'>
        Noticias recientes:
      </p>
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
