'use client'

import { Fragment } from 'react'
import * as Sentry from '@sentry/nextjs'
import { CategoryArticle } from '@components/CategoryArticle'
import { Loading } from '@components/LoadingCategory'
import { Newsletter } from '@components/Newsletter'
import { AdSenseBanner } from '@components/AdSenseBanner'
import { NotFoundAlert } from '@components/NotFoundAlert'
import { LoaderCategoryPosts } from '@components/LoaderCategoryPosts'
import { useAuthorPosts } from '@lib/hooks/data/useAuthorPosts'
import { ad } from '@lib/ads'

const postsQty = Number(process.env.NEXT_PUBLIC_POSTS_QTY_CATEGORY ?? 10)

export const AuthorPostsContent = ({ slug }: { slug: string }) => {
  const {
    data: result,
    error,
    isLoading,
    fetchMorePosts
  } = useAuthorPosts({ slug, qty: postsQty, offset: 0 })

  if (error) {
    Sentry.captureException(error, {
      tags: { component: 'AuthorPosts' },
      extra: { slug }
    })
    return null
  }

  if (isLoading) return <Loading />

  if (!result || result.edges.length === 0) return <NotFoundAlert />

  const { edges } = result

  return (
    <>
      <hr className='mb-6' />
      {edges.map(({ node }, index) => (
        <Fragment key={node.id}>
          <CategoryArticle
            {...node}
            featuredImage={undefined}
            isFirst={index === 0}
            isLast={index + 1 === edges.length}
            type='list'
          />
          {index + 1 === 5 && <Newsletter className='my-4 md:hidden' />}
          {(index + 1) % 5 === 0 && index !== edges.length - 1 && (
            <div className='py-4'>
              <AdSenseBanner
                className='bloque-adv-list'
                {...ad.category.in_article}
              />
            </div>
          )}
        </Fragment>
      ))}
      {edges.length >= postsQty && (
        <LoaderCategoryPosts
          slug={slug}
          qty={postsQty}
          initialOffset={postsQty}
          fetchMorePosts={fetchMorePosts}
        />
      )}
    </>
  )
}
