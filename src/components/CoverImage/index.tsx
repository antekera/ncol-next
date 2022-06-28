import cn from 'classnames'
import Image from 'next/image'
import Link from 'next/link'

type CoverImageProps = {
  coverImage: string
  title: string
  uri?: string
}

const defaultProps = {}

const CoverImage = ({ title, coverImage, uri }: CoverImageProps) => {
  const image = (
    <Image
      layout='fill'
      priority
      alt={title}
      src={coverImage}
      className={cn('shadow-small rounded object-cover ', {
        'hover:shadow-medium transition-shadow duration-200': uri,
      })}
    />
  )
  return (
    <div className='relative w-full h-64 mb-4 md:h-48 lg:h-80'>
      {uri ? (
        <Link href={uri}>
          <a aria-label={title}>{image}</a>
        </Link>
      ) : (
        image
      )}
    </div>
  )
}

CoverImage.defaultProps = defaultProps

export { CoverImage }
export type { CoverImageProps }
