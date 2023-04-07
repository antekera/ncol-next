import { CategoryArticle } from '@components/CategoryArticle'
import { PostsQueried } from '@lib/types'

const RelatedPosts = (posts: PostsQueried) => {
  if (!posts || posts.edges.length < 3) {
    return null
  }

  return (
    <div className='max-w-5xl mx-auto md:mt-12 sm:px-6 lg:px-8'>
      <h2 className='text-xl tracking-tight md:text-2xl text-slate-700 sm:text-3xl'>
        Noticias relacionadas
      </h2>
      <hr className='max-w-xl mt-3 mb-4 border-t-2 border-gray-300' />
      <div className='flex flex-wrap w-full -ml-3 md:ml-0 lg:flex-row lg:overflow-x-auto lg:w-11/12 md:gap-5'>
        {posts.edges.slice(0, 3).map(({ node }) => (
          <div
            key={node.uri}
            className='w-full md:w-1/2 lg:w-56 lg:flex-shrink-0'
          >
            <CategoryArticle {...node} type='thumbnail' />
          </div>
        ))}
        <ins
          className='adsbygoogle'
          style={{ display: 'block' }}
          data-ad-format='autorelaxed'
          data-ad-client='ca-pub-6715059182926587'
          data-ad-slot='2581285869'
        ></ins>
      </div>
      <div className='max-w-xl mt-16 mb-8'>
        <hr className='border-t-2 border-gray-300' />
      </div>
    </div>
  )
}

export { RelatedPosts }
