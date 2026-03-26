'use client'

import { AdSenseBanner } from '@components/AdSenseBanner'
import { CategoryArticle } from '@components/CategoryArticle'
import { LeftPostsSkeleton } from '@components/LoadingHome'
import { ad } from '@lib/ads'
import { RECENT_NEWS } from '@lib/constants'
import { useRelatedPosts } from '@lib/hooks/data/useRelatedPosts'

import { Categories } from '@lib/types'
import { getCategoryNode } from '@lib/utils'

import { isPostPublishedWithinDays } from '@lib/utils/isPostPublishedWithinDays'

const RelatedPosts = ({
  slug,
  inView,
  categories
}: {
  slug: string
  inView: boolean
  categories?: Categories
}) => {
  const categoryName = getCategoryNode(categories)?.slug
  const { data, isLoading } = useRelatedPosts({
    slug,
    enabled: inView,
    categoryName
  })

  const filteredPosts = data?.filter(({ node }) => {
    return (
      node.slug !== slug &&
      node.uri !== slug &&
      isPostPublishedWithinDays(node.date, 7)
    )
  })

  if (!isLoading && (!filteredPosts || filteredPosts.length < 3)) {
    return null
  }

  return (
    <div className='mx-auto max-w-5xl md:mt-12'>
      <h5 className='link-post-category border-primary bg-primary inline-block rounded-sm px-1 pt-1 pb-[3px] font-sans text-sm leading-none text-white uppercase'>
        {RECENT_NEWS}
      </h5>
      <hr className='mt-3 mb-4 max-w-xl border-t-2 border-gray-300 dark:border-neutral-500' />
      <div className='grid grid-cols-1 gap-5 md:grid-cols-3'>
        {isLoading ? (
          <>
            <div>
              <LeftPostsSkeleton />
            </div>
            <div>
              <LeftPostsSkeleton />
            </div>
            <div>
              <LeftPostsSkeleton />
            </div>
          </>
        ) : (
          <>
            {filteredPosts?.map(({ node }) => (
              <div key={node.slug}>
                <CategoryArticle
                  {...node}
                  type='thumbnail'
                  excerpt={undefined}
                />
              </div>
            ))}
          </>
        )}
      </div>
      <AdSenseBanner {...ad.global.related} />
    </div>
  )
}

export { RelatedPosts }
