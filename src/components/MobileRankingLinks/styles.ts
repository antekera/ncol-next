import { twMerge } from 'tailwind-merge'

export const getContainerClasses = () =>
  twMerge(
    'flex w-full items-center justify-center gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2.5 font-sans scrollbar-none md:hidden dark:border-neutral-700 dark:bg-neutral-900'
  )

export const getLinkClasses = (isActive = false) =>
  twMerge(
    'shrink-0 rounded-full border px-3.5 py-1 text-[11px] font-medium tracking-wide transition-colors active:scale-[0.98]',
    isActive
      ? 'bg-primary border-primary text-white'
      : 'border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-900 dark:border-neutral-600 dark:text-neutral-300 dark:hover:border-neutral-400 dark:hover:text-white'
  )
