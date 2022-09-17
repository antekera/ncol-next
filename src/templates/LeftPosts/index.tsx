import React from 'react'

import { CategoryArticle, AdDfpSlot } from '@components/index'
import { AD_DFP_HOME_FEED, SQUARE_C2 } from '@lib/ads'
import { HomePage } from '@lib/types'
import { isMobile } from 'react-device-detect'

const LeftPosts = ({ posts }: Pick<HomePage, 'posts'>): JSX.Element => {
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
          {index === 3 && (
            <AdDfpSlot id={AD_DFP_HOME_FEED.ID} className='pb-4' />
          )}
          {index === 10 && isMobile && (
            <AdDfpSlot id={SQUARE_C2.ID} className='pb-4' />
          )}
        </React.Fragment>
      ))}
    </>
  ) : (
    <></>
  )
}

export { LeftPosts }
