'use client'

import { CategoryArticle } from '@components/CategoryArticle'
import { RECENT_NEWS } from '@lib/constants'
import { PostsQueried } from '@lib/types'

const RelatedPostsSlider = ({ posts }: { posts?: PostsQueried['edges'] }) => {
  if (!posts || posts.length < 3) {
    return null
  }

  return (
    <div className='border-t border-slate-300 bg-white pt-2 dark:bg-neutral-800'>
      <h5 className='link-post-category border-primary bg-primary relative ml-7 inline-block rounded-sm px-1 pt-1 pb-[3px] font-sans text-xs leading-none text-white uppercase'>
        {RECENT_NEWS}
      </h5>
      <div className='slides-container flex snap-x snap-mandatory flex-nowrap space-x-3 overflow-hidden overflow-x-auto rounded-sm before:w-7 before:shrink-0 after:w-7 after:shrink-0'>
        {posts.map(({ node }, index) => (
          <div key={node.slug} className='slide w-48 flex-none pt-2'>
            <CategoryArticle
              type='recent_news'
              {...node}
              isFirst={index === 0}
              isLast={index + 1 === posts?.length}
              excerpt={undefined}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export { RelatedPostsSlider }
