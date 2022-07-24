import cn from 'classnames'
import Link from 'next/link'

import { DateTime, CoverImage, Excerpt } from '@components/index'
import { Post } from 'lib/types'

interface CategoryArticleProps
  extends Pick<
    Post,
    'id' | 'title' | 'uri' | 'featuredImage' | 'excerpt' | 'date'
  > {
  className?: string
  isLast: boolean
  isFirst: boolean
}

const CategoryArticle = ({
  id,
  title,
  uri,
  featuredImage,
  excerpt,
  date,
  className,
  isFirst,
  isLast
}: CategoryArticleProps): JSX.Element => {
  const classes = cn(
    'flex flex-row w-full py-6 border-b border-slate-200',
    { 'border-b-0': isLast },
    { 'pt-0': isFirst },
    className
  )

  return (
    <article key={id} className={classes}>
      <div className='flex-1 content-wrapper'>
        <Link href={uri}>
          <a aria-label={title}>
            <h2 className='mb-3 text-lg leading-tight sm:text-xl md:text-2xl text-slate-700 hover:text-primary'>
              {title}
            </h2>
          </a>
        </Link>
        {excerpt && <Excerpt text={excerpt} />}
        <div className='text-sm text-slate-500'>
          <DateTime dateString={date} />
        </div>
      </div>
      {featuredImage && (
        <div className='relative w-20 h-16 ml-3 sm:ml-5 sm:w-40 sm:h-28 image-wrapper lg:w-60 lg:h-40'>
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <CoverImage
              uri={uri}
              title={title}
              coverImage={featuredImage?.node.sourceUrl}
            />
          </div>
        </div>
      )}
    </article>
  )
}

export { CategoryArticle }
