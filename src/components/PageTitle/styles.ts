import { cn } from '@lib/shared'
import { ClassValue } from 'clsx'

export const getPageTitleClasses = (className?: ClassValue) =>
  cn('bg-primary h-20 md:h-24 dark:bg-neutral-800', className)
