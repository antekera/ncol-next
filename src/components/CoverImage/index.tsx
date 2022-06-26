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
      width={2000}
      height={1000}
      alt={title}
      src={coverImage}
      className={cn('shadow-small rounded', {
        'hover:shadow-medium transition-shadow duration-200': uri,
      })}
    />
  )
  return (
    <div className='mb-4'>
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
