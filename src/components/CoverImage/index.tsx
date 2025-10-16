import Image from 'next/image'
import Link from 'next/link'
import { CoverImageProps } from '@lib/types'
import { getImageClasses, getPictureClasses } from './styles'

type ImageSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg'

const sizeToWidth: Record<ImageSize, number> = {
  xxs: 175,
  xs: 175,
  sm: 371,
  md: 660,
  lg: 1134
}

const sizeToPx: Record<ImageSize, string> = {
  xxs: '175px',
  xs: '175px',
  sm: '371px',
  md: '660px',
  lg: '1134px'
}

const defaultSize = {
  width: 1134,
  height: 642
}

interface ImageData {
  src: string
  width: number
  height: number
}

interface ParsedEntry {
  url: string
  width: number
  actualWidth: number
  actualHeight: number
}

const getImageFromSrcSet = (
  srcSet?: string,
  size?: string,
  fallbackImage?: string
): ImageData => {
  if (!srcSet || !size || !fallbackImage) {
    return {
      src: fallbackImage || '',
      ...defaultSize
    }
  }

  const targetWidth = sizeToWidth[size as ImageSize]

  if (!targetWidth) {
    return {
      src: fallbackImage,
      ...defaultSize
    }
  }

  const srcSetEntries = srcSet.split(',').map(entry => entry.trim())

  const parsedEntries: ParsedEntry[] = srcSetEntries
    .map((entry): ParsedEntry | null => {
      // Use string methods instead of regex to avoid backtracking issues
      const lastSpaceIndex = entry.lastIndexOf(' ')
      if (lastSpaceIndex === -1) return null

      const widthPart = entry.substring(lastSpaceIndex + 1)
      if (!widthPart.endsWith('w')) return null

      const url = entry.substring(0, lastSpaceIndex)
      const widthStr = widthPart.slice(0, -1) // remove 'w'
      const width = parseInt(widthStr)

      if (isNaN(width) || !url.trim()) return null

      // Extract dimensions from URL using string methods instead of regex
      const getDimensionsFromUrl = (
        urlString: string
      ): { width: number; height: number } | null => {
        // Look for pattern like "-660x423." in the URL
        const lastDotIndex = urlString.lastIndexOf('.')
        if (lastDotIndex === -1) return null

        const beforeExtension = urlString.substring(0, lastDotIndex)
        const lastDashIndex = beforeExtension.lastIndexOf('-')
        if (lastDashIndex === -1) return null

        const dimensionPart = beforeExtension.substring(lastDashIndex + 1)
        const xIndex = dimensionPart.indexOf('x')
        if (xIndex === -1) return null

        const widthStr = dimensionPart.substring(0, xIndex)
        const heightStr = dimensionPart.substring(xIndex + 1)

        const parsedWidth = parseInt(widthStr)
        const parsedHeight = parseInt(heightStr)

        if (isNaN(parsedWidth) || isNaN(parsedHeight)) return null

        return { width: parsedWidth, height: parsedHeight }
      }

      const dimensions = getDimensionsFromUrl(url)
      let actualWidth = width
      let actualHeight: number

      if (dimensions) {
        actualWidth = dimensions.width
        actualHeight = dimensions.height
      } else {
        const aspectRatio = 9 / 16
        actualHeight = Math.round(width * aspectRatio)
      }

      return {
        url: url.trim(),
        width,
        actualWidth,
        actualHeight
      }
    })
    .filter((entry): entry is ParsedEntry => entry !== null)
    .sort((a, b) => a.width - b.width)

  if (parsedEntries.length === 0) {
    return {
      src: fallbackImage,
      ...defaultSize
    }
  }

  let bestMatch: ParsedEntry | undefined = undefined

  bestMatch = parsedEntries.find(entry => entry.width === targetWidth)

  if (!bestMatch) {
    bestMatch = parsedEntries.find(entry => entry.width >= targetWidth)
  }

  if (!bestMatch) {
    bestMatch = parsedEntries[parsedEntries.length - 1]
  }

  return {
    src: bestMatch.url,
    width: bestMatch.actualWidth,
    height: bestMatch.actualHeight
  }
}

const CoverImage = ({
  title,
  coverImage,
  uri,
  className,
  priority,
  lazy,
  fullHeight,
  srcSet,
  size
}: CoverImageProps) => {
  const { src, width, height } = getImageFromSrcSet(srcSet, size, coverImage)
  const imageClasses = getImageClasses({ uri, fullHeight })
  const pictureClasses = getPictureClasses(className)

  const getSizes = (): string => {
    if (!size) return '100vw'

    if (size in sizeToPx) {
      return sizeToPx[size as ImageSize]
    }

    return '100vw'
  }

  const image = (
    <picture className={pictureClasses}>
      <Image
        alt={`Imagen de la noticia: ${title}`}
        className={imageClasses}
        priority={priority}
        sizes={srcSet ? getSizes() : '100vw'}
        src={srcSet ? src : coverImage}
        loading={lazy ? 'lazy' : undefined}
        {...(fullHeight ? { width, height } : { fill: true })}
      />
    </picture>
  )

  return uri ? (
    <Link className='link-cover-image' href={uri} aria-label={title}>
      {image}
    </Link>
  ) : (
    image
  )
}

export { CoverImage }
