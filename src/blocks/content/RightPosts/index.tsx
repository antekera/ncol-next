import { Fragment } from 'react'
import { AdSenseBanner } from '@components/AdSenseBanner'
import { CategoryArticle } from '@components/CategoryArticle'
import { ad } from '@lib/ads'
import { PostHomeCol } from '@lib/types'

const RightPosts = ({ posts }: PostHomeCol) => {
  return posts ? (
    <>
      {posts.map(({ node }, index) => (
        <Fragment key={node.id}>
          <CategoryArticle
            key={node.id}
            {...node}
            excerpt={undefined}
            type='thumbnail'
            isFirst={index === 0}
            isLast={index + 1 === posts.length}
          />
        </Fragment>
      ))}
      <AdSenseBanner className='bloque-adv-list' {...ad.home.in_article_left} />
    </>
  ) : null
}

export { RightPosts }