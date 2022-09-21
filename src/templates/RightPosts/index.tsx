import React from 'react'

import { CategoryArticle, AdDfpSlot } from '@components/index'
import { PostHomeCol } from '@lib/types'

const RightPosts = ({ posts, ads }: PostHomeCol): JSX.Element => {
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
          {ads && index === 5 && (
            <AdDfpSlot id={ads.homeFeed2.id} className='mb-6' />
          )}
          {ads && index === 9 && (
            <AdDfpSlot id={ads.homeFeed3.id} className='mb-6' />
          )}
          {ads && index === 14 && (
            <AdDfpSlot id={ads.squareC2.id} className='mb-6 show-mobile' />
          )}
        </React.Fragment>
      ))}
    </>
  ) : (
    <></>
  )
}

export { RightPosts }
