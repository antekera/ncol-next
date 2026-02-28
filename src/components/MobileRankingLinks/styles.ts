import { twMerge } from 'tailwind-merge'

export const getContainerClasses = () =>
  twMerge(
    'flex md:hidden items-center justify-start overflow-x-auto no-scrollbar px-4 py-3 border-b dark:border-neutral-800 gap-2'
  )

export const getLinkClasses = () =>
  twMerge(
    'text-xs font-bold font-sans flex items-center gap-1.5 px-3 py-1.5 leading-none rounded-lg text-white whitespace-nowrap transition-all shadow-sm active:scale-95'
  )
