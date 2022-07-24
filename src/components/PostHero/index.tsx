import Link from 'next/link'

import {
  CoverImage,
  DateTime,
  Excerpt,
  PostCategories
} from '@components/index'
import { PostHome } from '@lib/types'

const PostHero = ({
  title,
  uri,
  date,
  excerpt,
  featuredImage,
  categories
}: PostHome): JSX.Element => {
  return (
    <section>
      {featuredImage && (
        <div className='relative w-full h-48 mb-4 sm:h-48 lg:h-80'>
          <CoverImage
            className='rounded'
            priority={true}
            uri={uri}
            title={title}
            coverImage={featuredImage?.node?.sourceUrl}
          />
        </div>
      )}
      {categories && <PostCategories slice={1} {...categories} />}
      <h1 className='mb-4 text-4xl leading-tight lg:text-6xl'>
        <Link href={uri}>
          <a aria-label={title}>{title}</a>
        </Link>
      </h1>
      <div className='mb-4 text-lg md:mb-0'>
        <DateTime dateString={date} />
      </div>
      {excerpt && <Excerpt text={excerpt} />}
    </section>
  )
}

export { PostHero }
