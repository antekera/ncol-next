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
        alt={`Imagen de la noticia: ${title}`}
        className={imageClasses}
        fill
        priority={priority}
        sizes='100vw'
        src={coverImage}
      />
    </picture>
  )
  return (
    <>
      {uri ? (
        <Link className='link-cover-image' href={uri} aria-label={title}>
          {image}
        </Link>
      ) : (
        image
      )}
    </>
  )
}

export { CoverImage }
export type { CoverImageProps }
