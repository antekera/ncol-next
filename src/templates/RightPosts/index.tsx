import { CategoryArticle } from '@components/CategoryArticle'
import { HomePage } from '@lib/types'

const RightPosts = ({ posts }: Pick<HomePage, 'posts'>): JSX.Element => {
  return posts ? (
    <div className='flex-none md:w-2/5 md:pl-4'>
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

export { RightPosts }
