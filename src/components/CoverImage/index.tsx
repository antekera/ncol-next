import cn from 'classnames'
import Image from 'next/image'
import Link from 'next/link'

type CoverImageProps = {
  coverImage: string
  title: string
  className?: string
  uri?: string
  priority?: boolean
}

const defaultProps = {}

const CoverImage = ({
  title,
  coverImage,
  uri,
  className,
  priority
}: CoverImageProps) => {
  const image = (
    <picture>
      <Image
        layout='fill'
        priority={priority}
        alt={`Imagen de la noticia: ${title}`}
        src={coverImage}
        className={cn(
          'object-cover',
          {
            'hover:opacity-75 duration-200': uri
          },
          className
        )}
      />
    </picture>
  )
  return (
    <>
      {uri ? (
        <Link href={uri}>
          <a aria-label={title}>{image}</a>
        </Link>
      ) : (
        image
      )}
    </>
  )
}

CoverImage.defaultProps = defaultProps

export { CoverImage }
export type { CoverImageProps }
