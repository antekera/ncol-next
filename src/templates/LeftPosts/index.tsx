import { CategoryArticle, AdDfpSlot } from '@components/index'
import { AD_DFP_HOME_FEED } from '@lib/constants'
import { HomePage } from '@lib/types'

const LeftPosts = ({ posts }: Pick<HomePage, 'posts'>): JSX.Element => {
  return posts ? (
    <>
      {posts.map(({ node }, index) => (
        <div key={node.id}>
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
        </div>
      ))}
    </>
  ) : (
    <></>
  )
}

export { LeftPosts }
