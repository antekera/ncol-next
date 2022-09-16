import { CategoryArticle, AdDfpSlot } from '@components/index'
import { AD_DFP_HOME_FEED_SECONDARY } from '@lib/constants'
import { HomePage } from '@lib/types'

const RightPosts = ({ posts }: Pick<HomePage, 'posts'>): JSX.Element => {
  return posts ? (
    <>
      {posts.map(({ node }, index) => (
        <div key={node.id}>
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
        </div>
      ))}
    </>
  ) : (
    <></>
  )
}

export { RightPosts }
