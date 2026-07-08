import { twMerge } from 'tailwind-merge'

export const getContainerClasses = () =>
  twMerge(
    'shadow-menu grid w-full grid-cols-3 items-stretch border-b border-solid border-slate-200 bg-white px-4 py-2 font-sans md:hidden dark:border-neutral-500 dark:bg-neutral-800'
  )

export const getLinkClasses = (color?: string) =>
  twMerge(
    'flex min-w-0 items-center justify-center px-2 py-2 text-center text-[11px] leading-tight font-semibold tracking-[0.08em] text-white uppercase transition-all active:scale-[0.99]',
    color
  )
