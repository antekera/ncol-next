'use client'

import { Fragment } from 'react'
import * as Sentry from '@sentry/browser'
import { notFound } from 'next/navigation'
import { AdSenseBanner } from '@components/AdSenseBanner'
import { CategoryArticle } from '@components/CategoryArticle'
import { Loading } from '@components/LoadingCategory'
import { Newsletter } from '@components/Newsletter'
import { ad } from '@lib/ads'
import { useTagPosts } from '@lib/hooks/data/useTagPosts'
import { NotFoundAlert } from '@components/NotFoundAlert'
import { LoaderCategoryPosts } from '@components/LoaderCategoryPosts'

const postsQty = Number(process.env.NEXT_PUBLIC_POSTS_QTY_CATEGORY ?? 10)

export const Content = ({ slug }: { slug: string }) => {
  const {
    data: result,
    error,
    isLoading,
    fetchMorePosts
  } = useTagPosts({ slug, qty: postsQty, offset: 0 })

  if (error) {
    Sentry.captureException('Failed to fetch tag posts')
    return notFound()
  }

  if (isLoading) {
    return <Loading />
  }

  if (!isLoading && (!result || result.edges.length === 0)) {
    return <NotFoundAlert />
  }

  const { edges } = result ?? { edges: [] }

  return (
    <>
      {edges.map(({ node }, index) => (
        <Fragment key={node.id}>
          <CategoryArticle
            {...node}
            isFirst={index === 0}
            isLast={index + 1 === edges.length}
          />
          {index + 1 === 5 && <Newsletter className='my-4 md:hidden' />}
          {(index + 1) % 5 === 0 && index !== edges.length - 1 && (
            <AdSenseBanner
              className='bloque-adv-list'
              {...ad.category.in_article}
            />
          )}
        </Fragment>
      ))}
      <LoaderCategoryPosts
        slug={slug}
        qty={postsQty}
        fetchMorePosts={fetchMorePosts}
      />
      <AdSenseBanner {...ad.global.more_news} />
    </>
  )
}
