import { CategoryArticle } from '@components/CategoryArticle'
import { HomePage } from '@lib/types'

const LeftPosts = ({ posts }: Pick<HomePage, 'posts'>): JSX.Element => {
  return posts ? (
    <div className='flex-none md:w-3/5 md:pl-5 md:pr-3'>
      {posts.map(({ node }, index) => (
        <CategoryArticle
          key={node.id}
          {...node}
          excerpt={undefined}
          type='thumbnail'
          isFirst={index === 0}
          isLast={index + 1 === posts.length}
        />
      ))}
    </div>
  ) : (
    <></>
  )
}

export { LeftPosts }
