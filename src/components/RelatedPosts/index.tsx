import { AdSenseBanner } from '@components/AdSenseBanner'
import { CategoryArticle } from '@components/CategoryArticle'
import { PostsQueried } from '@lib/types'

const RelatedPosts = ({ posts }: { posts?: PostsQueried }) => {
  if (!posts || posts.edges.length < 3) {
    return null
  }

  return (
    <div className='mx-auto max-w-5xl sm:px-6 md:mt-12 lg:px-8'>
      <h2 className='text-xl tracking-tight text-slate-700 sm:text-3xl md:text-2xl'>
        Más información
      </h2>
      <hr className='mt-3 mb-4 max-w-xl border-t-2 border-gray-300' />
      <div className='-ml-3 flex w-full flex-wrap md:ml-0 md:gap-5 lg:w-11/12 lg:flex-row'>
        {posts?.edges?.slice(0, 6).map(({ node }) => (
          <div key={node.uri} className='w-full md:w-1/2 lg:w-56 lg:shrink-0'>
            <CategoryArticle {...node} type='thumbnail' />
          </div>
        ))}
        <AdSenseBanner />
      </div>
      <div className='mt-16 mb-8 max-w-xl'>
        <hr className='border-t-2 border-gray-300' />
      </div>
    </div>
  )
}

export { RelatedPosts }
