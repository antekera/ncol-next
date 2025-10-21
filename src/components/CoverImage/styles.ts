import { cn } from '@lib/shared'

type ImageClassesProps = {
  uri?: string
  fullHeight?: boolean
}

export const getImageClasses = ({ uri, fullHeight }: ImageClassesProps) =>
  cn('object-cover sm:rounded', {
    'duration-200 hover:opacity-75': uri,
    'h-auto w-full': fullHeight
  })

export const getPictureClasses = (className?: string) =>
  cn('relative h-auto w-full', className)
