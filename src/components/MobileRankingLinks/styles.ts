import { twMerge } from 'tailwind-merge'

export const getContainerClasses = () =>
  twMerge(
    'flex md:hidden items-center justify-center px-1 py-2 border-b dark:border-neutral-500 gap-2'
  )

export const getLinkClasses = () =>
  twMerge(
    'text-sm font-sans bg-primary px-2 py-1 leading-none rounded-full dark:text-neutral-300 text-white dark:text-neutral-200 hover:opacity-85'
  )
