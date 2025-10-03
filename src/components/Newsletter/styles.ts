import { cn } from '@lib/shared'
import { ClassValue } from 'clsx'

export const getNewsletterClasses = (className?: ClassValue) =>
  cn(
    'mb-8 rounded-lg bg-slate-100 p-4 font-sans md:mb-4 dark:bg-neutral-800',
    className
  )
