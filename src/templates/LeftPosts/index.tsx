import { Fragment } from 'react'

import { CategoryArticle } from '@components/CategoryArticle'
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
        </Fragment>
      ))}
    </>
  ) : (
    <></>
  )
}

export { LeftPosts }
