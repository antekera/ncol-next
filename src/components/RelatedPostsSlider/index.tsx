'use client'

import { CategoryArticle } from '@components/CategoryArticle'
import { RECENT_NEWS } from '@lib/constants'
import { useRelatedPosts } from '@lib/hooks/data/useRelatedPosts'

const RelatedPostsSlider = ({
  slug,
  inView
}: {
  slug: string
  inView: boolean
}) => {
  const { data } = useRelatedPosts({ slug, enabled: inView })

  if (!data || data.length < 3) {
    return null
  }

  return (
    <div className='border-t border-slate-200 bg-white pt-2 dark:border-neutral-500 dark:bg-neutral-800'>
      <h5 className='link-post-category border-primary bg-primary relative ml-4 inline-block rounded-sm px-1 pt-1 pb-[3px] font-sans text-xs leading-none text-white uppercase'>
        {RECENT_NEWS}
      </h5>
      <div className='slides-container flex snap-x snap-mandatory flex-nowrap space-x-3 overflow-hidden overflow-x-auto rounded-sm'>
        {data.map(({ node }, index) => (
          <div key={node.slug} className='slide w-48 flex-none pt-2'>
            <CategoryArticle
              type='recent_news'
              {...node}
              isFirst={index === 0}
              isLast={index + 1 === data?.length}
              excerpt={undefined}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export { RelatedPostsSlider }
