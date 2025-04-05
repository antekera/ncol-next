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

const postsQty = Number(process.env.NEXT_PUBLIC_POSTS_QTY_CATEGORY ?? 10)

export const Content = ({ slug }: { slug: string }) => {
  const { data: result, error } = useCategoryPosts({ slug, qty: postsQty })

  if (error) {
    Sentry.captureException('Failed to fetch category posts')
    return notFound()
  }

  if (!result?.edges) {
    return <Loading />
  }

  const { edges } = result

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
      <AdSenseBanner {...ad.global.more_news} />
    </>
  )
}
