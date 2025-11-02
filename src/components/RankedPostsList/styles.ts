import { twMerge } from 'tailwind-merge'

export const getPostClasses = () =>
  twMerge(
    'relative border-b border-b-gray-200 py-4 flex-row [&:last-child]:border-b-0'
  )

export const getPostRankClasses = () =>
  twMerge(
    'pointer-events-none absolute left-0 z-10 flex h-7 w-7 items-center justify-center rounded-tl-xs bg-sky-600/75 text-center font-sans text-lg text-sm text-white dark:bg-neutral-600/75 dark:text-neutral-300'
  )
