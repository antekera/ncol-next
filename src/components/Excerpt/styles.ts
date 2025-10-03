import { cn } from '@lib/shared'
import { ClassValue } from 'clsx'

export const getExcerptClasses = (className?: ClassValue) =>
  cn(
    'text-sm text-slate-500 sm:text-base lg:text-base dark:text-neutral-300',
    className
  )
