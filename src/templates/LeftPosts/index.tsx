import React from 'react'

import { CategoryArticle } from '@components/CategoryArticle'
import { PostHomeCol } from '@lib/types'

const LeftPosts = ({ posts }: PostHomeCol): JSX.Element => {
  return posts ? (
    <>
      {posts.map(({ node }, index) => (
        <React.Fragment key={node.id}>
          <CategoryArticle
            {...node}
            excerpt={undefined}
            type='secondary'
            isFirst={index === 0}
            isLast={index + 1 === posts.length}
          />
        </React.Fragment>
      ))}
    </>
  ) : (
    <></>
  )
}

export { LeftPosts }
