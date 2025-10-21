import { twMerge } from 'tailwind-merge'

export const getContainerClasses = () =>
  twMerge(
    'flex md:hidden items-center justify-center bg-white px-1 py-2 border-b border-gray-200 gap-2'
  )

export const getLinkClasses = () =>
  twMerge(
    'text-sm font-sans text-white bg-primary dark:bg-neutral-800 px-4 py-1 leading-none rounded-full hover:opacity-75'
  )
