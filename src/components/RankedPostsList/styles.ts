import { twMerge } from 'tailwind-merge'

export const getContainerClasses = (className?: string) =>
  twMerge('bg-white', className)

export const getTitleSectionClasses = (showTitle?: boolean) =>
  twMerge(
    'border-b-2 border-b-primary-100 pb-2',
    !showTitle && 'border-b-0'
  )

export const getTitleClasses = () =>
  'font-bold text-xl text-primary-100 flex items-center'

export const getSeparatorClasses = () => 'border-b-2 border-b-gray-200'

export const getPostsContainerClasses = (isRow?: boolean) =>
  twMerge(
    'grid grid-cols-1 gap-4 pt-4',
    isRow && 'md:grid-cols-2 lg:grid-cols-5'
  )

export const getPostClasses = (isRow?: boolean) =>
  twMerge(
    'relative flex items-start gap-2 border-b border-b-gray-200 py-4',
    isRow ? 'flex-col md:border-b-0' : 'flex-row',
    !isRow && '[&:last-child]:border-b-0'
  )

export const getPostRankClasses = (isRow?: boolean) =>
  twMerge(
    'z-20 flex items-center justify-center rounded-full bg-primary-100 font-bold text-white',
    isRow
      ? 'absolute -right-1 -top-1 h-8 w-8 text-lg'
      : 'h-6 w-6 flex-shrink-0 text-sm'
  )