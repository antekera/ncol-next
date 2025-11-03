import { cn } from '@lib/shared'

export const getContainerClasses = (className?: string) =>
  cn('most-visited-posts', className)

export const getTitleSectionClasses = (showTitle?: boolean) =>
  cn('mb-4', showTitle ? 'block' : 'hidden')

export const getTitleClasses = () =>
  cn(
    'mb-1 font-sans text-sm leading-none font-bold text-slate-700 uppercase dark:text-neutral-300'
  )

export const getSeparatorClasses = () =>
  cn('border-gray-300 dark:border-neutral-500')

export const getPostsContainerClasses = (isRow: boolean) =>
  cn(
    isRow
      ? 'space-y-4'
      : 'slides-container flex snap-x snap-mandatory flex-nowrap space-x-3 overflow-hidden overflow-x-auto rounded-sm'
  )

export const getPostClasses = (isRow: boolean) =>
  cn(
    'relative border-slate-200 dark:border-neutral-500',
    isRow ? 'border-b pb-4 last:border-b-0' : 'slide w-48 flex-none pt-2'
  )

export const getPostRankClasses = (isRow: boolean) =>
  cn(
    isRow ? 'top-0' : 'top-2',
    'pointer-events-none absolute left-0 z-10 flex h-7 w-7 items-center justify-center rounded-tl-xs bg-sky-600/75 text-center font-sans text-lg text-sm text-white dark:bg-neutral-600/75 dark:text-neutral-300'
  )

export const getSkeletonItemClasses = (isRow?: boolean) =>
  cn('flex', isRow ? 'flex-row items-center space-x-3' : 'flex-col space-y-2')

export const getSkeletonImageClasses = (isRow?: boolean) =>
  cn(isRow ? 'h-16 w-20 flex-shrink-0 sm:h-20 sm:w-24' : 'h-32 w-full sm:h-40')

export const getSkeletonContentClasses = (isRow?: boolean) =>
  cn('flex-1 space-y-2', isRow ? '' : 'px-2 pb-2')
