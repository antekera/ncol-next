import { cn } from '@lib/shared'
import { ClassValue } from 'clsx'

export const getPostCategoriesClasses = (className?: ClassValue) =>
  cn(
    'link-post-category relative mr-2 inline-block font-sans text-xs leading-none dark:text-neutral-300',
    className
  )
