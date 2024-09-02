import Image from 'next/image'
import Link from 'next/link'

import { cn } from '@lib/shared'

type CoverImageProps = {
  coverImage: string
  title: string
  className?: string
  uri?: string
  priority?: boolean
  lazy?: boolean
}

const CoverImage = ({
  title,
  coverImage,
  uri,
  className,
  priority,
  lazy
}: CoverImageProps) => {
  const imageClasses = cn('object-cover', {
    'duration-200 hover:opacity-75': uri
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
        loading={lazy ? 'lazy' : undefined}
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
