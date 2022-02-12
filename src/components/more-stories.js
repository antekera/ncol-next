import PostPreview from 'components/post-preview'

export default function MoreStories({ posts }) {
  return (
    <section>
      <h2 className='mb-8 text-6xl font-bold leading-tight tracking-tighter md:text-7xl'>
        More Stories
      </h2>
      <div className='mb-32 grid grid-cols-2 md:grid-cols-3 md:col-gap-16 lg:col-gap-32 row-gap-20 md:row-gap-32'>
        {posts.map(({ node }) => (
          <PostPreview
            key={node.slug}
            title={node.title}
            coverImage={node ? node.featuredImage?.node?.sourceUrl : null}
            date={node.date}
            uri={node.uri}
            excerpt={node.excerpt}
          />
        ))}
      </div>
    </section>
  )
}
