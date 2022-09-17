import React from 'react'

import { CategoryArticle, AdDfpSlot } from '@components/index'
import { AD_DFP_HOME_FEED_SECONDARY, SQUARE_C2 } from '@lib/ads'
import { HomePage } from '@lib/types'
import { isMobile } from 'react-device-detect'

const RightPosts = ({ posts }: Pick<HomePage, 'posts'>): JSX.Element => {
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
          {index === 5 && (
            <AdDfpSlot id={AD_DFP_HOME_FEED_SECONDARY.ID} className='mb-6' />
          )}
          {index === 9 && (
            <AdDfpSlot id={AD_DFP_HOME_FEED_SECONDARY.ID} className='mb-6' />
          )}
          {index === 14 && isMobile && (
            <AdDfpSlot id={SQUARE_C2.ID} className='mb-6' />
          )}
        </React.Fragment>
      ))}
    </>
  ) : (
    <></>
  )
}

export { RightPosts }
