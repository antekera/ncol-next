'use client'

import { AdSenseBanner } from '@components/AdSenseBanner'
import { CategoryArticle } from '@components/CategoryArticle'
import { LeftPostsSkeleton } from '@components/LoadingHome'
import { ad } from '@lib/ads'
import { RECENT_NEWS } from '@lib/constants'
import { useRelatedPosts } from '@lib/hooks/data/useRelatedPosts'

const RelatedPosts = ({ slug, inView }: { slug: string; inView: boolean }) => {
  const { data, isLoading } = useRelatedPosts({ slug, enabled: inView })

  return (
    <div className='mx-auto max-w-5xl md:mt-12'>
      <h5 className='link-post-category border-primary bg-primary inline-block rounded-sm px-1 pt-1 pb-[3px] font-sans text-sm leading-none text-white uppercase'>
        {RECENT_NEWS}
      </h5>
      <hr className='mt-3 mb-4 max-w-xl border-t-2 border-gray-300 dark:border-neutral-500' />
      <div className='grid grid-cols-3 gap-5'>
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
            {data?.map(({ node }) => (
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
