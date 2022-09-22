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

const CoverImage = ({
  title,
  coverImage,
  uri,
  className,
  priority
}: CoverImageProps) => {
  const imageClasses = cn('object-cover', {
    'hover:opacity-75 duration-200': uri
  })
  const image = (
    <picture className={className}>
      <Image
        layout='fill'
        priority={priority}
        alt={`Imagen de la noticia: ${title}`}
        src={coverImage}
        className={imageClasses}
      />
    </picture>
  )
  return (
    <>
      {uri ? (
        <Link className='link-cover-image' href={uri}>
          <a aria-label={title}>{image}</a>
        </Link>
      ) : (
        image
      )}
    </>
  )
}

export { CoverImage }
export type { CoverImageProps }
