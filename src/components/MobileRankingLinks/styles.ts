import { twMerge } from 'tailwind-merge'

export const getContainerClasses = () =>
  twMerge(
    'flex md:hidden items-center justify-center p-4 border-b border-gray-200 gap-x-4'
  )

export const getLinkClasses = () =>
  twMerge(
    'bg-primary text-primary-foreground font-bold text-lg rounded-full px-4 py-2 flex items-center'
  )