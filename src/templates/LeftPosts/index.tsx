import React from 'react'

import { CategoryArticle, AdDfpSlot } from '@components/index'
import { PostHomeCol } from '@lib/types'

const LeftPosts = ({ posts, ads }: PostHomeCol): JSX.Element => {
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
          {ads && index === 3 && (
            <AdDfpSlot id={ads.homeFeed.id} className='pb-6 bloque-adv-list' />
          )}
          {ads && index === 10 && (
            <AdDfpSlot
              id={ads.squareC1.id}
              className='pb-6 show-mobile bloque-adv-list'
            />
          )}
        </React.Fragment>
      ))}
    </>
  ) : (
    <></>
  )
}

export { LeftPosts }
