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
    <div className='related-posts'>
      <h5 className='related-posts-title'>{RECENT_NEWS}</h5>
      <hr className='related-posts-separator' />
      <div className='related-posts-grid'>
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