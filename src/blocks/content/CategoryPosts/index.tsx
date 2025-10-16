'use client'

import { Fragment } from 'react'
import * as Sentry from '@sentry/browser'
import { notFound } from 'next/navigation'
import { AdSenseBanner } from '@components/AdSenseBanner'
import { CategoryArticle } from '@components/CategoryArticle'
import { Loading } from '@components/LoadingCategory'
import { Newsletter } from '@components/Newsletter'
import { ad } from '@lib/ads'
import { useCategoryPosts } from '@lib/hooks/data/useCategoryPosts'
import { NotFoundAlert } from '@components/NotFoundAlert'
import { LoaderCategoryPosts } from '@components/LoaderCategoryPosts'
import { MostVisitedPosts } from '@components/MostVisitedPosts'
import { useIsMobile } from '@lib/hooks/useIsMobile'
import './category-posts.css'

const postsQty = Number(process.env.NEXT_PUBLIC_POSTS_QTY_CATEGORY ?? 10)

export const Content = ({ slug }: { slug: string }) => {
  const {
    data: result,
    error,
    isLoading,
    fetchMorePosts
  } = useCategoryPosts({ slug, qty: postsQty, offset: 0 })
  const isMobile = useIsMobile()

  if (error) {
    Sentry.captureException('Failed to fetch category posts')
    return notFound()
  }

  if (isLoading) {
    return <Loading />
  }

  if (result?.edges.length === 0 && !isLoading) {
    return <NotFoundAlert />
  }

  const { edges } = result ?? { edges: [] }

  return (
    <>
      {isMobile && (
        <MostVisitedPosts isLayoutMobile className='sidebar-most-visited' />
      )}
      {edges.map(({ node }, index) => (
        <Fragment key={node.id}>
          <CategoryArticle
            {...node}
            isFirst={index === 0}
            isLast={index + 1 === edges.length}
            type='list'
          />
          {index + 1 === 5 && (
            <Newsletter className='category-posts-newsletter' />
          )}
          {(index + 1) % 5 === 0 && index !== edges.length - 1 && (
            <div className='category-posts-ad'>
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
          fetchMorePosts={fetchMorePosts}
        />
      )}
      <AdSenseBanner {...ad.global.more_news} />
    </>
  )
}