import { cn } from '@lib/shared'
import { ClassValue } from 'clsx'

export const getSkeletonClasses = (className?: ClassValue) =>
  cn('animate-pulse bg-gray-300 dark:bg-neutral-600', className)
