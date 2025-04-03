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
  fullHeight?: boolean
}

const CoverImage = ({
  title,
  coverImage,
  uri,
  className,
  priority,
  lazy,
  fullHeight
}: CoverImageProps) => {
  const imageClasses = cn(
    `rounded ${fullHeight ? 'h-auto w-full object-cover' : 'object-cover'}`,
    {
      'duration-200 hover:opacity-75': uri
    }
  )
  const image = (
    <picture className={cn('relative h-auto w-full', className)}>
      <Image
        alt={`Imagen de la noticia: ${title}`}
        className={imageClasses}
        {...(fullHeight ? { width: 0, height: 0 } : { fill: true })}
        priority={priority}
        sizes='100vw'
        src={coverImage}
        loading={lazy ? 'lazy' : undefined}
      />
    </picture>
  )

  return (
    <div className='min-h-[200px]'>
      {uri ? (
        <Link className='link-cover-image' href={uri} aria-label={title}>
          {image}
        </Link>
      ) : (
        image
      )}
    </div>
  )
}

export { CoverImage }
