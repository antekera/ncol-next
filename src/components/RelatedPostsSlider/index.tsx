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
    <div className='related-posts-slider'>
      <h5 className='related-posts-slider-title'>{RECENT_NEWS}</h5>
      <div className='related-posts-slider-container'>
        {data.map(({ node }, index) => (
          <div key={node.slug} className='related-posts-slider-slide'>
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