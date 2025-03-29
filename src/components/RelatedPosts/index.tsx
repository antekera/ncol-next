'use client'

import { AdSenseBanner } from '@components/AdSenseBanner'
import { CategoryArticle } from '@components/CategoryArticle'
import { ad } from '@lib/ads'
import { RECENT_NEWS } from '@lib/constants'
import { PostsQueried } from '@lib/types'

const RelatedPosts = ({ posts }: { posts?: PostsQueried['edges'] }) => {
  if (!posts || posts.length < 3) {
    return null
  }

  return (
    <div className='mx-auto max-w-5xl sm:px-6 md:mt-12 lg:px-8'>
      <h5 className='link-post-category border-primary bg-primary inline-block rounded-sm px-1 pt-1 pb-[3px] font-sans text-sm leading-none text-white uppercase'>
        {RECENT_NEWS}
      </h5>
      <hr className='mt-3 mb-4 max-w-xl border-t-2 border-gray-300 dark:border-neutral-500' />
      <div className='-ml-3 flex w-full flex-wrap md:ml-0 md:gap-5 lg:w-11/12 lg:flex-row'>
        {posts.map(({ node }) => (
          <div key={node.slug} className='w-full md:w-1/2 lg:w-56 lg:shrink-0'>
            <CategoryArticle {...node} type='thumbnail' excerpt={undefined} />
          </div>
        ))}
      </div>
      <AdSenseBanner {...ad.global.related} />
      <div className='mt-16 mb-8 max-w-xl'>
        <hr className='border-t-2 border-gray-300 dark:border-neutral-500' />
      </div>
    </div>
  )
}

export { RelatedPosts }
