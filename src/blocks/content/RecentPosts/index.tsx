'use client'

import { Fragment } from 'react'
import * as Sentry from '@sentry/nextjs'
import { notFound } from 'next/navigation'
import { CategoryArticle } from '@components/CategoryArticle'
import { Loading } from '@components/LoadingCategory'
import { Newsletter } from '@components/Newsletter'
import { NcolAdSlot } from '@components/NcolAdSlot'
import { useRecentPosts } from '@lib/hooks/data/useRecentPosts'
import { NotFoundAlert } from '@components/NotFoundAlert'
import { LoaderCategoryPosts } from '@components/LoaderCategoryPosts'

const postsQty = Number(process.env.NEXT_PUBLIC_POSTS_QTY_CATEGORY ?? 10)

export const Content = () => {
  const {
    data: result,
    error,
    isLoading,
    fetchMorePosts
  } = useRecentPosts({
    qty: postsQty,
    initialQty: 8,
    offset: 0
  })

  if (error) {
    Sentry.captureException(error, {
      tags: { component: 'RecentPosts' },
      extra: { qty: postsQty }
    })
    return notFound()
  }

  if (isLoading) {
    return <Loading />
  }

  if (result?.edges.length === 0 && !isLoading) {
    return <NotFoundAlert />
  }

  const edges = result?.edges ?? []

  return (
    <>
      <hr className='mb-6' />
      {edges.map(({ node }, index) => (
        <Fragment key={node.id}>
          <CategoryArticle
            {...node}
            isFirst={index === 0}
            isLast={index + 1 === edges.length}
            type='list'
          />
          {index + 1 === 5 && <Newsletter className='my-4 md:hidden' />}
          {(index + 1) % 5 === 0 && index !== edges.length - 1 && (
            <div className='py-4'>
              <NcolAdSlot slot='inline' className='flex justify-center' />
            </div>
          )}
        </Fragment>
      ))}
      {edges.length >= 8 && (
        <LoaderCategoryPosts
          slug='por-fecha'
          qty={postsQty}
          initialOffset={8}
          fetchMorePosts={fetchMorePosts}
        />
      )}
      <NcolAdSlot slot='inline' className='flex justify-center py-4' />
    </>
  )
}
