'use client'

import { CategoryArticle } from '@components/CategoryArticle'
import { RECENT_NEWS } from '@lib/constants'

import { useRelatedPosts } from '@lib/hooks/data/useRelatedPosts'

import { Categories } from '@lib/types'
import { getCategoryNode } from '@lib/utils'

import { isPostPublishedWithinDays } from '@lib/utils/isPostPublishedWithinDays'
import type { PostsQueried } from '@lib/types'

const RelatedPostsSlider = ({
  slug,
  categories,
  inView,
  initialPosts
}: {
  slug: string
  categories?: Categories
  inView: boolean
  initialPosts?: PostsQueried['edges']
}) => {
  const categoryName = getCategoryNode(categories)?.slug
  const { data } = useRelatedPosts({
    slug,
    enabled: inView && !initialPosts,
    categoryName
  })

  const filteredPosts = (initialPosts ?? data)?.filter(({ node }) => {
    return (
      node.slug !== slug &&
      node.uri !== slug &&
      isPostPublishedWithinDays(node.date, 7)
    )
  })

  if (!filteredPosts || filteredPosts.length < 3) {
    return null
  }

  return (
    <div className='border-t border-slate-200 pt-2 pb-4 dark:border-neutral-500'>
      <h5 className='link-post-category border-primary bg-primary relative inline-block rounded-sm px-1 pt-1 pb-[3px] font-sans text-xs leading-none text-white uppercase'>
        {RECENT_NEWS}
      </h5>
      <div className='slides-container flex snap-x snap-mandatory flex-nowrap space-x-3 overflow-hidden overflow-x-auto rounded-sm'>
        {filteredPosts.map(({ node }, index) => (
          <div key={node.slug} className='slide w-48 flex-none pt-2'>
            <CategoryArticle
              type='recent_news'
              {...node}
              isFirst={index === 0}
              isLast={index + 1 === filteredPosts.length}
              excerpt={undefined}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export { RelatedPostsSlider }
