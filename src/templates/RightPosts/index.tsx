import React from 'react'

import { CategoryArticle } from '@components/CategoryArticle'
import { PostHomeCol } from '@lib/types'

const RightPosts = ({ posts }: PostHomeCol) => {
  return posts ? (
    <>
      {posts.map(({ node }, index) => (
        <React.Fragment key={node.id}>
          <CategoryArticle
            key={node.id}
            {...node}
            excerpt={undefined}
            type='thumbnail'
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

export { RightPosts }
