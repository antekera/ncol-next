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
          {(index + 1) % 5 === 0 && index !== posts.length - 1 && (
            <AdSenseBanner
              className='bloque-adv-list pb-6'
              {...ad.home.in_article_left}
            />
          )}
        </Fragment>
      ))}
    </>
  ) : null
}

export { RightPosts }
