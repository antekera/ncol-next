import { CoverImage } from '@components/CoverImage'
import { PostCategories } from '@components/PostCategories'
import { PostHome } from '@lib/types'
import { DateTime } from '@components/DateTime'
import { Excerpt } from '@components/Excerpt'
import { PostHeroTitleLink } from './PostHeroTitleLink'
import { NcolAdSlot } from '@components/NcolAdSlot'

type PostHeroProps = {
  post: PostHome | null
}

const PostHero = ({ post }: PostHeroProps) => {
  if (!post) return null

  const { featuredImage, uri, title, excerpt, date, categories } = post

  return (
    <>
      <section className='mb-4'>
        {featuredImage && title && (
          <div className='relative z-1 -mx-6 -mb-12 h-48 w-auto sm:mx-0 sm:h-64 sm:w-full lg:h-72'>
            <CoverImage
              className='relative block h-48 w-full sm:h-60 md:h-60 lg:h-72'
              priority={true}
              uri={uri}
              title={title}
              coverImage={featuredImage?.node?.sourceUrl}
              srcSet={featuredImage?.node?.srcSet}
              size='lg'
            />
          </div>
        )}
        <div className='content border-primary relative z-2 -ml-6 w-auto border-t-4 bg-white px-5 py-4 sm:ml-0 sm:w-11/12 dark:bg-neutral-800 dark:hover:text-neutral-100'>
          {categories && (
            <PostCategories
              slice={2}
              className='text-primary mb-3 uppercase'
              {...categories}
            />
          )}
          {uri && (
            <h1 className='mb-2 font-serif text-2xl leading-8 font-bold text-slate-900 lg:text-4xl lg:leading-11'>
              <PostHeroTitleLink href={uri} title={title} />
            </h1>
          )}
          <hr className='relative mt-4 mb-3 w-full text-slate-200 sm:w-48 md:w-80 dark:border-neutral-500' />
          <div className='mb-4 font-sans text-xs md:mb-0'>
            <Excerpt className='mb-2' text={excerpt} />
            <DateTime dateString={date} />
          </div>
        </div>
      </section>
      <NcolAdSlot slot='article-top' className='my-4 flex justify-center' />
    </>
  )
}

export { PostHero }
