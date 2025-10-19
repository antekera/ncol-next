import { twMerge } from 'tailwind-merge'

export const getContainerClasses = () =>
  twMerge(
    'flex md:hidden items-center justify-center bg-white p-4 border-b border-gray-200'
  )

export const getLinkClasses = () =>
  twMerge('text-lg font-bold text-primary-100')

export const getSeparatorClasses = () =>
  twMerge('h-6 w-px bg-gray-300 mx-4')