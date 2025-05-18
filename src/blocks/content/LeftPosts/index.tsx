import { Fragment } from 'react'
import { AdSenseBanner } from '@components/AdSenseBanner'
import { CategoryArticle } from '@components/CategoryArticle'
import { ad } from '@lib/ads'
import { PostHomeCol } from '@lib/types'

const LeftPosts = ({ posts }: PostHomeCol) => {
  return posts ? (
    <>
      {posts.map(({ node }, index) => (
        <Fragment key={node.id}>
          <CategoryArticle
            {...node}
            excerpt={undefined}
            type='secondary'
            isFirst={index === 0}
            isLast={index + 1 === posts.length}
          />
          {(index + 1) % 5 === 0 && index !== posts.length - 1 && (
            <AdSenseBanner {...ad.home.in_article_left} />
          )}
        </Fragment>
      ))}
    </>
  ) : null
}

export { LeftPosts }
